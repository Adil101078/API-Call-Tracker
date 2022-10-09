const express = require('express')
const trackerRouter = require('./trackerReport/trackerRoute')
const adminRouter = require('../components/admin/adminRoute')

const router = express.Router()

router.use('/', trackerRouter)
router.use('/admin', adminRouter)

module.exports = router