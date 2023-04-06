const {trackerModel} = require('../components/trackerReport/trackerModel')
const logger = require('./logger')
const moment = require('moment')

module.exports = {
    ClearDB : async function (){
        try {
            const startDate = moment().subtract('1', 'month').startOf('day').toISOString()
            const endDate = new Date(moment().endOf('day').toISOString())
            logger.info('Flushing Database...')
            const data = await trackerModel.deleteMany({ createdAt: { $gte: new Date(startDate), $lte: new Date(endDate)}})
            logger.info('Database cleared successfully.')
            return data             
        } catch (error) {
            logger.error(error)
            throw new Error(error)
        }
    }
}
