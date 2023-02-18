const {trackerModel} = require('../components/trackerReport/trackerModel')
const logger = require('./logger')

module.exports = {
    ClearDB : async function (){
        try {
            logger.info('Flushing Database...')
            const data = await trackerModel.deleteMany()
            logger.info('Database cleared successfully.')
            return data             
        } catch (error) {
            logger.error(error)
            throw new Error(error)
        }
    }
}
