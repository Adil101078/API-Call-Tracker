const nodemailer = require('nodemailer')
const Config  = require('../config/index')


module.exports = {
  SendEmail: ({ to, template, subject, attachments = [] }) => {
    const transport = nodemailer.createTransport({
        host: Config.NODE_MAILER.HOST,
        port: Config.NODE_MAILER.PORT,
        secure: true,
        auth: {
          user: Config.NODE_MAILER.EMAIL,
          pass: Config.NODE_MAILER.PASS,
        }
     });
     const mailOptions = {
        from: Config.NODE_MAILER.SENDER, 
        to,
        subject,
        html: template,
        attachments
    };
    
    transport.sendMail(mailOptions, function(err, info) {
       if (err){
            return Logger.error(JSON.stringify(err));
       } else {
            return Logger.info(`Email sent successfully to ${to}!`);
       }
       
    });
}
} 