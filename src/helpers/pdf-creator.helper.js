const converter = require('json2csv');
const fs = require('fs');
const { trackerModel } = require('../components/trackerReport/trackerModel');
// const moment = require('moment');
const { SendEmail } = require('./emal.helper');
const logger = require('./logger');
const { template } = require('../utils/templates/pdf');


  module.exports ={
    GeneratePDF: async()=>{
      // const startDate = moment().subtract('1', 'month').startOf('day').toISOString()
      // const endDate = new Date(moment().endOf('day').toISOString())
      const timeDiff = 86000      
      const data = await trackerModel.aggregate([
        // {
        //   $match:{
        //     createdAt:{$gte: new Date(startDate), $lte: new Date(endDate)}
        //   }
        // },
        {
        $group: {
         _id: {
          date: {
           $dateToString: {
            date: '$createdAt',
            format: '%d/%m/%Y'
           }
          },
          companyCode: '$companyCode'
         },
         count: {
          $sum: 1
         }
        }
       }, {
        $sort: {
         '_id.date': -1,
         count: -1
        }
       }, {
        $project: {
          _id:0,
         Company_Code: '$_id.companyCode',
         Hits: '$count',
         'Hits/sec': { $divide: ['$count', timeDiff]},
         Date: '$_id.date',
        }
       }])
       if(data.length > 0){
         const fields = Object.keys(data[0])
         const csv = new converter.Parser({ fields})
         fs.writeFile('data.csv', csv.parse(data),async (err)=>{
           if(err){
             logger.error(err)
             throw err
           }
           const attachment = fs.readFileSync("data.csv");
           SendEmail({
            to: process.env.RECEIVER_EMAIL || 'javedtraveasy@outlook.com',
            template: template(),
            subject: 'API Hits Report',
            attachments: [{
              filename: 'Resport.csv',
              content: attachment
            }]
           })
           logger.info('File saved!')
         })
        
       }
       return data

    }
  }
