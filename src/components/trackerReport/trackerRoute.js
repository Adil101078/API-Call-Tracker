const express = require('express')
const { Wrap } = require('../../helpers/commonHelpers')
const controller = require('./trackerController')

const router = express.Router()

router.post('/create-report', Wrap(controller.createTrackingReport))
router.get('/tracking-reports', Wrap(controller.getTrackingReports))
router.delete('/delete-report', Wrap(controller.deleteBulkReport))

module.exports = router