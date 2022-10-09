const jwt = require('jsonwebtoken')
const Model = require('../components/admin/adminModel')
module.exports = {
	isAdmin: async (req, res, next) => {
		let token
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1]
		} else if ('jwt' in req.cookies) {
			token = req.cookies.jwt
		}

		if (!token) {
			req.flash('error', 'Please login to continue.')
			return res.redirect('/api/v1/admin/login')
		}
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRETKEY)
			const data = decoded
			const userData = await Model.Admin.findById(data._id)
			req.user = userData
			return next()
		} catch (err) {
			res.clearCookie('jwt')
			req.flash('error', 'Session expired. Please login.')
			return res.redirect('/api/v1/admin/login')
		}
	},
}
