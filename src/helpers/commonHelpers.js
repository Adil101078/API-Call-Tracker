const moment = require('moment')

module.exports = {
    dateToUtcStartDate(date) {
        return moment(new Date(date)).utc().startOf('day').toISOString()
    },
    dateToUtcEndDate(date) {
        return moment(new Date(date)).utc().endOf('day').toISOString()
    },
    getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }
}