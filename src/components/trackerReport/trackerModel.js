const mongoose = require('mongoose')
const db = require('../../connections/db')

const trackerSchema = new mongoose.Schema(
	{
		companyCode: {
			type: String,
			required: true,
			index: true
		},
		credentialCode: String,
		secretKey: String,
		IP: String,		
		referralUrl: String,
		searchId: String,
		origin: String,
		destination: String,
		classOfService: String,
        adults: String,
        child: String,
        infants: String,
        currency: String
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

const trackerModel =  db.model('api_call_tracker', trackerSchema)
module.exports.trackerModel = trackerModel

