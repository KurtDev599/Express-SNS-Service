const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')

dotenv.config()
const pageRouter = require('./routes/page')
const { sequelize } = require('./models')

const app = express()
app.set('port', process.env.PRT || 8081)
app.set('view engine', 'html')
nunjucks.configure('view', {
  express: app,
  watch: true
})
sequelize.sync({ force: false })
  .then(() => {
    console.log('database connected')
  })
  .catch((err) => {
    console.log('database failed', err)
  })

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secur: false
  }
}))

app.use('/', pageRouter)

app.use((err, req, res, next) => {
  const error = new Error(`${req.method}, ${req.url} 라우터가 없습니다.`)
  error.status = 404;
  next(err)
})

app.use((err, req, res, next) => {
  res.locals.message = err.statusMessage
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.statusCode || 500)
  console.log(err)
  next(err)
})

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중')
})
