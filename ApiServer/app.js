const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const morgan = require('morgan')
const nunjucks =  require('nunjucks')
const dotenv = require('dotenv')

dotenv.config()
const authRouter = require('./routes/auth')
const indexRouter = require('./routes')
const { sequelize } = require('./models')
const passportConfig = require('./passport')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8002)

sequelize.sync({force: false})
  .then(() => {
    console.log('db connection')
  })
.catch((err) => {
  console.error('database failed', err)
})

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
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
app.use(passport.initialize())
app.use(passport.session())

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
