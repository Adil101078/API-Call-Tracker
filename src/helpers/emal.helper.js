const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const logger = require("./logger");

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sender = process.env.SENDER_EMAIL
const receiver = process.env.RECEIVER_EMAIL


module.exports = {
    SendMail: async(data)=>{
        try {
            const msg = {
                to: receiver,
                from: sender,
                subject: "Monthly API Tracker Report",
                content:[{
                  type: "text/plain",
                  value:' Please find the attached CSV file.'
                }],
                attachments: [
                  {
                    content: data,
                    filename: "data.csv",
                    type: "application/csv",
                    disposition: "attachment",
                  },
                ],
              };
      
              await sgMail.send(msg).catch((err) => {
                logger.error(err?.response?.body);
              }); 
        } catch (error) {
            logger.error(error)
        }
        
        
    }
}

