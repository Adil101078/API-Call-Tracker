const logger = require('./logger');
const { trackerModel } = require('../components/trackerReport/trackerModel');
const config = require('../config');
const { GeneratePDF } = require('./pdf-creator.helper');
const { MongoClient } = require('mongodb');
const url = config.secondaryDb
const COLLECTION_NAME = 'reports';

async function connectToMongo() {
    const client = new MongoClient(url, config.db.options);
    try {
        await client.connect();
        logger.info(`Secondary Database Connected Successfully.`)
        return client;
    } catch (error) {
        logger.error(`Error Connecting to Secondary Database: ${error?.message}`)
        throw error;
    }
}
const monitorAndCleanup = async () => {
    try {
        const stats = await trackerModel.collection.stats({ scale: 1024 })
        const totalStorage = stats.storageSize;
        const dataSize = stats.size;
        const thresholdPercentage = config.thresholdPercentage
        const storageUsed = (Math.round((dataSize / 460800) * 100))

        logger.warn(`Storage Usage: ${storageUsed}%`)
        logger.warn(`Used: ${(dataSize / 1024).toFixed(2)}MB`)
        if (storageUsed >= thresholdPercentage) {
            logger.info(`Database storage is full | Performing Delete operation`)
            await moveDatabaseDocuments()
        }
        return true
    } catch (error) {
        return logger.error(`Error: ${error?.message}`)
    }
}

const moveDatabaseDocuments = async () => {
    const client = await connectToMongo();
    try {
        const db = client.db();
        const data = await GeneratePDF()
        const result = await db.collection(COLLECTION_NAME).insertMany(data)
        if (result) {
            await trackerModel.deleteMany()
        }
        return true

    } catch (error) {
        return logger.error(`Error: ${error?.message}`)
    } finally {
        await client.close()
    }

}
const fetchArchivedData = async (dataObj) => {
    const client = await connectToMongo();
    try {
        let { search, start, length, companyCode, startDate, endDate } = dataObj
        const orderBy = dataObj.columns[dataObj.order[0].column].data
        const orderByData = {}
        orderByData[orderBy] = dataObj.order[0].dir == 'asc' ? 1 : -1
        search = search.value != '' ? search.value : false
        const db = client.db();
        const collection = db.collection(COLLECTION_NAME)
        let query = []
        if (startDate && endDate) {
            query.unshift({
                $match: {
                    $or: [
                        {
                            Date: startDate,
                        },
                        {
                            Date: endDate,
                        },
                    ],
                },
            })
        }
        if (companyCode) {
            query.unshift({
                $match: {
                    Company_Code: companyCode
                }
            })
        }
        query.push({
            $group: {
                _id: {
                    date: '$Date',
                    companyCode: '$Company_Code'
                },
                "Hits/sec": {
                    $first: '$Hits/sec'
                },
                Hits: {
                    $first: '$Hits'
                }
            }
        },
            {
                $project: {
                    _id: 0,
                    Company_Code: '$_id.companyCode',
                    Hits: 1,
                    'Hits/sec': 1,
                    Date: '$_id.date',
                }
            })
        query.push({ $sort: orderByData })
        query.push({
            $facet: {
                list: [
                    {
                        $skip: Number(start) || 0,
                    },
                    {
                        $limit: Number(length) || 10,
                    },
                ],
                totalRecords: [
                    {
                        $count: 'count',
                    },
                ],
            },
        })
        const response = await collection.aggregate(query).toArray()
        const responseData = {
            draw: dataObj.draw,
            recordsTotal: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            recordsFiltered: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            data: response[0] ? response[0].list : [],
        }
        return responseData
    } catch (err) {
        logger.error(err)
    } finally{
        await client.close()
    }

}

module.exports = {
    monitorAndCleanup,
    fetchArchivedData
}
