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
    try {
        const client = await connectToMongo();
        const db = client.db();     
        const data = await GeneratePDF()
        const result = await db.collection(COLLECTION_NAME).insertMany(data)
        if(result){
            await trackerModel.deleteMany()
        }
        await client.close()
        return true
        
    } catch (error) {
        return logger.error(`Error: ${error?.message}`)
    }
    
}
const fetchArchivedData = async(dataObj) => {
    let { search, start, length } = dataObj
    const orderBy = dataObj.columns[dataObj.order[0].column].data
    const orderByData = {}
    orderByData[orderBy] = dataObj.order[0].dir == 'asc' ? 1 : -1
    search = search.value != '' ? search.value : false
    const client = await connectToMongo();
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME)
    const query = [
        {
            $sort:{Date: -1}
        }
    ]
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
    
    await client.close()
    return responseData
    
}

module.exports = {
    monitorAndCleanup,
    fetchArchivedData
}
