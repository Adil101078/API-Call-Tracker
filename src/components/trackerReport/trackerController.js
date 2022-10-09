const Model = require('./trackerModel')
const requestHandler = require('../../helpers/requestHandler')
const logger = require('../../helpers/logger')
const moment = require('moment')

function dateToUtcStartDate(date) {
    return moment(new Date(date)).utc().startOf('day').toISOString()
}
function dateToUtcEndDate(date) {
    return moment(new Date(date)).utc().endOf('day').toISOString()
}

module.exports = {
    createTrackingReport: async (req, res) => {
        logger.info('Inside createTrackingReport Controller')
        try {
            if (!req.body.companyCode)
                return requestHandler.handleError({ res, err_msg: 'Company code is required.' })
            const newReport = new Model.trackerModel({ ...req.body })
            const data = await newReport.save()
            return requestHandler.handleResponse({ res, data, statusCode: 201, msg: 'Report created successfully.' })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    getTrackingReports: async (req, res) => {
        logger.info('Inside getTrackingReport Controller')
        try {
            const { search, startDate, endDate } = req.query
            const limit = req.query.limit ? parseInt(req.query.limit) : 100
            const page = req.query.page ? parseInt(req.query.page) : 1
            const skip = (page - 1) * limit
            let query = []
            let filter = {}
            // query.push(
            //     { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit },
            //     {
            //         $group: {
            //             _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, apiHitCount: { $sum: 1 },
            //             data: {
            //                 $push: {
            //                     _id: '$_id',
            //                     companyCode: '$companyCode',
            //                     credentialCode: "$credentialCode",
            //                     secretKey: "$secretKey",
            //                     IP: "$IP",
            //                     referralUrl: "$referralUrl",
            //                     searchId: "$searchId",
            //                     origin: "$origin",
            //                     destination: "$destination",
            //                     classOfService: "$classOfService",
            //                     adults: "$adults",
            //                     child: "$child",
            //                     infants: "$infants",
            //                     currency: "$currency",
            //                     createdAt: "$createdAt",
            //                     updatedAt: "$updatedAt"
            //                 }
            //             }
            //         }
            //     },)
            if (search) {
                query.unshift({
                    $match: {
                        companyCode: search
                    }
                })
            }

            query.push(
                {
                    $facet: {
                     data: [
                      {
                       $match: filter
                      }
                     ],
                     totalRecords: [
                      {
                       $count: 'count'
                      }
                     ],
                     dateWiseHits: [
                      {
                       $group: {
                        _id: {
                         $dateToString: {
                          date: '$createdAt',
                          format: '%Y-%m-%d'
                         }
                        },
                        count: {
                         $sum: 1
                        }
                       }
                      }
                     ]
                    }
                   }
            )

            if (startDate && endDate) {
                query.unshift(
                    {
                        $match: {
                            createdAt: { $gte: new Date(dateToUtcStartDate(startDate)), $lte: new Date(dateToUtcEndDate(endDate)) },

                        }
                    }
                )
            }


            const response = await Model.trackerModel.aggregate(query)
            return requestHandler.handleResponse({
                res,
                data: response,
                msg: 'Records fetched successfully.'
            })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    },
    deleteReport: async (req, res) => {
        logger.info('Inside getTrackingReport Controller')
        try {
            const { reportId } = req.params
            if (!reportId)
                return requestHandler.handleError({ res, err_msg: 'Please provide record ID.' })
            const data = await Model.trackerModel.findById(reportId)
            if (!data)
                return requestHandler.handleError({ res, err_msg: 'Record not found.' })
            await data.remove()
            return requestHandler.handleResponse({
                res,
                data,
                msg: 'Records deleted successfully.'
            })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    }
}