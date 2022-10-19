const Model = require('./trackerModel')
const requestHandler = require('../../helpers/requestHandler')
const logger = require('../../helpers/logger')
const { dateToUtcStartDate, dateToUtcEndDate } = require('../../helpers/commonHelpers')

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
            query.push(
                { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, apiHitCount: { $sum: 1 },
                        data: {
                            $push: {
                                _id: '$_id',
                                companyCode: '$companyCode',
                                credentialCode: "$credentialCode",
                                secretKey: "$secretKey",
                                IP: "$IP",
                                referralUrl: "$referralUrl",
                                searchId: "$searchId",
                                origin: "$origin",
                                destination: "$destination",
                                classOfService: "$classOfService",
                                adults: "$adults",
                                child: "$child",
                                infants: "$infants",
                                currency: "$currency",
                                createdAt: "$createdAt",
                                updatedAt: "$updatedAt"
                            }
                        }
                    }
                },)
            if (search) {
                query.unshift({
                    $match: {
                        companyCode: search
                    }
                })
            }
            // query.push(
            //     {
            //         $group: {
            //          _id: {
            //           $dateToString: {
            //            date: '$createdAt',
            //            format: '%Y-%m-%d'
            //           }
            //          },
            //          count: {
            //           $sum: 1
            //          }
            //         }
            //        }
            // )

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
    deleteBulkReport: async (req, res) => {
        logger.info('Inside getTrackingReport Controller')
        try {
            const { startDate, endDate, companyCode } = req.query
            let filters = {}
            if(startDate && endDate){
                filters.createdAt = { $gte: new Date(dateToUtcStartDate(startDate)), $lte: new Date(dateToUtcEndDate(endDate))}
            }
            if(companyCode){
                filter.companyCode = companyCode
            }
            const data = await Model.trackerModel.deleteMany(filters)
            return requestHandler.handleResponse({
                res,
                data:`${data.deletedCount} records deleted.`,
                msg: 'Records deleted successfully.'
            })
        } catch (err) {
            logger.error(err)
            return requestHandler.handleError({ res, err_msg: err.message })
        }
    }
}