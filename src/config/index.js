require('dotenv').config()

module.exports =  {
	db: {
		str: process.env.MONGO_URL,
		options: {
			// auto_reconnect: true,
			maxPoolSize: 200,
			useNewUrlParser: true,
			readPreference: 'primaryPreferred',
			// useUnifiedTopology: true,
			// useFindAndModify: false,
			// useCreateIndex: true,
		},
	},
}
