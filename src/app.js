const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const path = require('path')
const app = express()
const indexRouter = require('./components/index')
const flash = require('connect-flash')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const adminRouter = require('./components/admin/adminRoute')
const cron = require('node-cron')
const {ClearDB} = require('./helpers/db.helper')

app.use(function (req, res, next) {
	res.setHeader(
		'Content-Security-Policy',
		"default-src * self  blob: data: gap://ready; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
		)
		next()
	})
app.use(cors({ credentials: true, origin: true }))
app.use(logger('dev'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
	session({
		cookie: { maxAge: 60000 },
		store: new MemoryStore({
			checkPeriod: 86400000, // prune expired entries every 24h
		}),
		saveUninitialized: true,
		resave: 'true',
		secret: 'secret',
	})
)
app.use(flash())
app.use('/api/v1', indexRouter)
app.use('/', adminRouter)

cron.schedule('0 0 * * 0', async()=>{
	await ClearDB()
})

module.exports = app