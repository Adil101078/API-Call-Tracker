const express = require('express')
const { isAdmin } = require('../../middleware/auth')
const controller = require('./adminController')

const router = express.Router()

router.post('/login', controller.initiateLogin)
router.get('/login', controller.renderLogin)
router.get('/tracker-reports', isAdmin, controller.renderTrackerReport)
router.get('/tracker-reports.listing', isAdmin, controller.trackerReportListing)

module.exports = router