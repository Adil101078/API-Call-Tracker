const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../../connections/db')

const adminSchema = new mongoose.Schema(
	{
		fullName: String,
        email:{
            type: String,
            required: true
        },
        password: String,
        adminType:{
            type: String,
            enum:['admin', 'superAdmin']
        }
		
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

adminSchema.methods.verifyPassword = function (password) {
	return bcrypt.compareSync(password, this.password)
}

adminSchema.methods.generateJwt = function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_SECRETKEY, {
		expiresIn: process.env.JWT_EXP,
	})
}

const Admin =  db.model('admin', adminSchema)
module.exports.Admin = Admin

