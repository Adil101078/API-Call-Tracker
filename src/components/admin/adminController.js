const mongoose = require('mongoose')
const Model = require('./adminModel')
const requestHandler = require('../../helpers/requestHandler')
const logger = require('../../helpers/logger')
const { trackerModel } = require('../trackerReport/trackerModel')
const bcrypt = require('bcryptjs')
const { dateToUtcStartDate, dateToUtcEndDate, getUniqueListBy } = require('../../helpers/commonHelpers')
const moment = require('moment')
const { fetchArchivedData } = require('../../helpers/db.helper')

module.exports = {
    initiateLogin: async (req, res) => {
        logger.info('Inside Login Controller')

        const { email, password } = req.body
        if (!email || !password)
            return requestHandler.handleError({ res, err_msg: 'Please provide both email and password.' })

        const data = await Model.Admin.findOne({ email })

        if (!data)
            return requestHandler.handleError({ res, err_msg: 'Email is not registered.' })

        if (data) {
            if (!(await data.verifyPassword(password, data.password))) {
                return requestHandler.handleError({ res, err_msg: 'Invalid credentials.' })
            } else {
                const token = await data.generateJwt()
                res.cookie('jwt', token)
                return requestHandler.handleResponse({ res, msg: 'Logged in successfully.' })
            }
        }

    },
    renderLogin: async (req, res) => {
        logger.info('Inside renderLogin Controller')
        if (req.cookies.jwt !== undefined) {
            return res.redirect('/tracker-reports')
        } else {
            return res.render('admin/login', {})
        }

    },
    renderTrackerReport: async (req, res) => {

        const userId = req.user._id
        const currentUser = await Model.Admin.findById(userId)
        const companyCodes = await trackerModel.aggregate([
            {
                $group:{
                    _id: '$companyCode'
                }
            }
        ])
        return res.render('admin/tracker-reports', { currentUser, pageName: 'Track', companyCodes })

    },
    trackerReportListing: async (req, res) => {
        
        let { startDate, endDate, search, start, length, companyCode } = req.query
        const orderBy = req.query.columns[req.query.order[0].column].data
        const orderByData = {}
        orderByData[orderBy] = req.query.order[0].dir == 'asc' ? 1 : -1
        search = search.value != '' ? search.value : false
        let query = []
        query.push(
            {
                $group: {
                    "_id": {
                        "date": {
                            $dateToString: {
                                date: '$createdAt',
                                format: "%Y-%m-%d"
                            }
                        },
                        "companyCode": "$companyCode"
                    },
                    count: { $sum: 1 },

                }
            },
            {
                $sort: {
                    '_id.date': -1,
                    count: -1
                }
            },
        )
        if (search) {
            query.unshift({
                $match: {
                    $or: [
                        {
                            count: { $regex: search, $options: 'i' },
                        },
                        {
                            companyCode: { $regex: search, $options: 'i' },
                        },
                        {
                            currency: { $regex: search, $options: 'i' },
                        },
                        {
                            classOfService: { $regex: search, $options: 'i' },
                        },
                        {
                            origin: { $regex: search, $options: 'i' },
                        },
                        {
                            destination: { $regex: search, $options: 'i' },
                        },
                    ],
                },
            })
        }

        if (startDate && endDate) {
            let startToISO = dateToUtcStartDate(startDate)
            let endToISO = dateToUtcEndDate(endDate)
            query.unshift({
                $match: {
                    $or: [
                        {
                            createdAt: { $gte: new Date(startToISO), $lte: new Date(endToISO) },
                        },
                    ],
                },
            })
        }
        if (companyCode) {
            query.unshift({
                $match: {
                    companyCode: companyCode
                }
            })
        }
        query.push({
            $facet: {
                list: [
                    {
                        $skip: Number(start) || 0,
                    },
                    {
                        $limit: Number(length) || 10,
                    },
                ],
                totalRecords: [
                    {
                        $count: 'count',
                    },
                ],
            },
        })
        let response = await trackerModel.aggregate(query)
        let responseData = {
            draw: req.query.draw,
            recordsTotal: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            recordsFiltered: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            data: response[0] ? response[0].list : [],
        }
        return res.send(responseData)

    },
    trackerReportDateWiseListing: async (req, res) => {

        let { search, start, length, date, companyCode } = req.query
        const orderBy = req.query.columns[req.query.order[0].column].data
        const orderByData = {}
        orderByData[orderBy] = req.query.order[0].dir == 'asc' ? 1 : -1
        search = search.value != '' ? search.value : false
        let query = []
        query.push(

            {
                $match: {
                    companyCode,
                    createdAt: { $gte: new Date(dateToUtcStartDate(date)), $lte: new Date(dateToUtcEndDate(date)) }
                }
            },
        )
        if (search) {
            query.push({
                $match: {
                    $or: [
                        {
                            companyCode: { $regex: search, $options: 'i' },
                        },
                        {
                            currency: { $regex: search, $options: 'i' },
                        },
                        {
                            classOfService: { $regex: search, $options: 'i' },
                        },
                        {
                            origin: { $regex: search, $options: 'i' },
                        },
                        {
                            destination: { $regex: search, $options: 'i' },
                        },
                        {
                            IP: { $regex: search, $options: 'i' },
                        },
                    ],
                },
            })
        }
        query.push({
            $facet: {
                list: [
                    {
                        $sort: orderByData
                    },
                    {
                        $skip: Number(start) || 0,
                    },
                    {
                        $limit: Number(length) || 10,
                    },
                ],
                totalRecords: [
                    {
                        $count: 'count',
                    },
                ],
            },
        })
        let response = await trackerModel.aggregate(query, { allowDiskUse: true })
        let responseData = {
            draw: req.query.draw,
            recordsTotal: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            recordsFiltered: response[0].totalRecords[0] ? response[0].totalRecords[0].count : 0,
            data: response[0] ? response[0].list : [],
        }
        return res.send(responseData)

    },
    renderTrackerReportDateWise: async (req, res) => {

        const userId = req.user._id
        const currentUser = await Model.Admin.findById(userId)
        // const company = await trackerModel.find().lean()
        // const companyCodes = getUniqueListBy(company, 'companyCode')
        return res.render('admin/dateWiseReportListing', { currentUser, pageName: 'Track', companyCodes: ['null'] })

    },
    createSuperAdmin: async () => {

        const checkSuperAdmin = await Model.Admin.findOne({ adminType: "superAdmin" })
        if (checkSuperAdmin) return

        // Create Super admin
        const password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12)
        const adminData = {
            fullName: process.env.SUPER_ADMIN_FULLNAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password,
            adminType: 'superAdmin'
        }

        const superAdmin = await Model.Admin.create(adminData)
        return logger.info(`SuperAdmin created with name ${superAdmin.fullName}`)

    },
    logout: async (req, res) => {

        await res.clearCookie('jwt')
        return requestHandler.handleResponse({ res, data: null })

    },
    chartData: async(req, res)=>{
        const { startDate, endDate, code } = req.query
        const data = await trackerModel.aggregate([
            {
                $match: {
                    companyCode: code,
                    createdAt: { $gte: new Date(dateToUtcStartDate(startDate)), $lte: new Date(dateToUtcEndDate(endDate))}
                }
            },
            {
                $group: {
                    _id: '$destination',
                    totalHits: {
                        $count: {}
                    }
                }
            },
            {
                $sort: {
                    totalHits: -1
                }
            },
            {
                $limit: 25
            }
        ])
        return requestHandler.handleResponse({ res, data })
    },
    chartDataIPAddress: async(req, res)=>{
        const { startDate, endDate, code } = req.query
        const data = await trackerModel.aggregate([
            {
                $match: {
                    companyCode: code,
                    createdAt: { $gte: new Date(dateToUtcStartDate(startDate)), $lte: new Date(dateToUtcEndDate(endDate))}
                }
            },
            {
                $group: {
                    _id: '$IP',
                    totalHits: {
                        $count: {}
                    }
                }
            },
            {
                $sort: {
                    totalHits: -1
                }
            },
            {
                $limit: 25
            }
        ])
        return requestHandler.handleResponse({ res, data })
    },
    pastReport: async(req, res) => {
        const data = await fetchArchivedData(req.query)
        return res.send(data)
    }
}