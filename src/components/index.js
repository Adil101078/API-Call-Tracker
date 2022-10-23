const express = require('express')
const trackerRouter = require('./trackerReport/trackerRoute')

const router = express.Router()

router.use('/', trackerRouter)

module.exports = router