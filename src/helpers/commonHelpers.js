const moment = require('moment')
const logger = require('./logger')
const { handleError } = require('./requestHandler')

module.exports = {
    dateToUtcStartDate(date) {
        return moment(new Date(date)).utc().startOf('day').toISOString()
    },
    dateToUtcEndDate(date) {
        return moment(new Date(date)).utc().endOf('day').toISOString()
    },
    getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    },
    Wrap(controller){
        return async (req, res, next) => {
            try {
                await controller(req, res, next);
            } catch (error) {
                logger.error(error)
                return handleError({ res, err_msg: error.message })
            }
        };
        
          
    }
}