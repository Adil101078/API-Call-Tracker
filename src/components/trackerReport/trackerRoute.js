const express = require('express')
const controller = require('./trackerController')

const router = express.Router()

router.post('/create-report', controller.createTrackingReport)
router.get('/tracking-reports', controller.getTrackingReports)
router.delete('/delete-report', controller.deleteBulkReport)

module.exports = router