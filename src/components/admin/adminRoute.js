const express = require('express')
const { Wrap } = require('../../helpers/commonHelpers')
const { isAdmin } = require('../../middleware/auth')
const controller = require('./adminController')

const router = express.Router()

router.post('/login', Wrap(controller.initiateLogin))
router.get('/login', Wrap(controller.renderLogin))
router.patch('/logout', Wrap(controller.logout))
router.get('/tracker-reports', isAdmin, Wrap(controller.renderTrackerReport))
router.get('/tracker-reports.listing', isAdmin, Wrap(controller.trackerReportListing))
router.get('/tracker-report.byDate', isAdmin, Wrap(controller.trackerReportDateWiseListing))
router.get('/tracker-reports.byDate', isAdmin, Wrap(controller.renderTrackerReportDateWise))
router.get('/companyCode.chartData', Wrap(controller.chartData))
router.get('/companyCode.chartDataIP', Wrap(controller.chartDataIPAddress))

module.exports = router