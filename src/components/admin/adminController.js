const mongoose = require('mongoose')
const Model = require('./adminModel')
const requestHandler = require('../../helpers/requestHandler')
const logger = require('../../helpers/logger')
const moment = require('moment')
const { trackerModel } = require('../trackerReport/trackerModel')
const bcrypt = require('bcryptjs')

function dateToUtcStartDate(date) {
    return moment(new Date(date)).utc().startOf('day').toISOString()
}
function dateToUtcEndDate(date) {
    return moment(new Date(date)).utc().endOf('day').toISOString()
}
function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

module.exports = {
    initiateLogin: async (req, res) => {
        logger.info('Inside Login Controller')
        try {
            const { email, password } = req.body
            if (!email || !password)
                return requestHandler.handleError({ res, err_msg: 'Please provide both email and password.' })

            const data = await Model.Admin.findOne({ email })

            if (!data)
                return handleError({ res, err_msg: 'Email is not registered.' })

            if (data) {
                if (!(await data.verifyPassword(password, data.password))) {
                    return handleError({ res, err_msg: 'Invalid credentials.' })
                } else {
                    const token = await data.generateJwt()
                    res.cookie('jwt', token)
                    return requestHandler.handleResponse({ res, msg: 'Logged in successfully.' })
                }
            }
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    renderLogin: async (req, res) => {
        logger.info('Inside renderLogin Controller')
        try {
            console.log(req.cookies)
            if (req.cookies.jwt !== undefined) {
                return res.redirect('/api/v1/admin/tracker-reports')
            } else {
                return res.render('admin/login', {})
            }
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    renderTrackerReport: async (req, res) => {
        try {
            const userId = req.user._id
            const currentUser = await Model.Admin.findById(userId)
            const company = await trackerModel.find().lean()
            const companyCodes = getUniqueListBy(company, 'companyCode')
            return res.render('admin/tracker-reports', { currentUser, pageName: 'Track', companyCodes })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    trackerReportListing: async (req, res) => {
        try {
            let { startDate, endDate, search, start, length, companyCode } = req.query
            const orderBy = req.query.columns[req.query.order[0].column].data
            const orderByData = {}
            orderByData[orderBy] = req.query.order[0].dir == 'asc' ? 1 : -1
            search = search.value != '' ? search.value : false
            let query = []
            query.push(
                
                {
                    $group:  {
                        "_id": {
                      "date": {$dateToString:{
                        date:'$createdAt',
                        format: "%Y-%m-%d"
                      }},
                      "companyCode": "$companyCode"
                  },
                      count: { $sum:1 }
                       
                     }
                }, 
                {
                    $sort: {
                        '_id.date': -1
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
            if(companyCode){
                query.unshift({
                    $match:{
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
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    trackerReportDateWiseListing: async (req, res) => {
        try {
            let { search, start, length, date, companyCode } = req.query
            const orderBy = req.query.columns[req.query.order[0].column].data
            const orderByData = {}
            orderByData[orderBy] = req.query.order[0].dir == 'asc' ? 1 : -1
            search = search.value != '' ? search.value : false
            let query = []
            query.push(
                
                {
                    $match:{
                        companyCode,
                        createdAt: { $gte: new Date(dateToUtcStartDate(date)), $lte: new Date(dateToUtcEndDate(date))}
                    }
                },{
                    $sort:{
                        createdAt:-1
                    }
                }
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
                        ],
                    },
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
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    renderTrackerReportDateWise: async(req, res)=>{
        try {
            const userId = req.user._id
            const { date } = req.query
            const currentUser = await Model.Admin.findById(userId)
            const company = await trackerModel.find().lean()
            const companyCodes = getUniqueListBy(company, 'companyCode')
            return res.render('admin/dateWiseReportListing', { currentUser, pageName: 'Track', companyCodes })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    createSuperAdmin: async () => {
        try {
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
        } catch (err) {
            logger.error(err)
        }
    },
    logout: async (req, res) => {
		try {
			await res.clearCookie('jwt')
			return requestHandler.handleResponse({ res, data: null })
		} catch (err) {
			return requestHandler.handleError({ res, err })
		}
	},
}