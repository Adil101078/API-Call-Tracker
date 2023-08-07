require('dotenv').config()

module.exports =  {
	db: {
		str: process.env.MONGO_URL,
		options: {
			maxPoolSize: 200,
			useNewUrlParser: true,
			readPreference: 'primaryPreferred',
		},
	},
	NODE_MAILER:{
		HOST: process.env.NODE_MAILER_HOST,
		PORT: process.env.NODE_MAILER_PORT,
		EMAIL: process.env.NODE_MAILER_EMAIL,
		PASS: process.env.NODE_MAILER_PASS,
		SENDER: process.env.NODE_MAILER_SENDER,  
	  },
	thresholdPercentage: +process.env.THRESHOLD_PERCENTAGE || 90,
	secondaryDb: process.env.SECONDARY_DB
}
