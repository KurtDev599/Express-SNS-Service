const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')
const passport = require('passport')

const app = express()

dotenv.config()

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/img', express.static(path.join(__dirname, 'uploads')))
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
app.use(passport.initialize())
app.use(passport.session())

const pageRouter = require('./routes/page')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const userRouter = require('./routes/user')

const { sequelize } = require('./models')
const passportConfig = require('./passport')

app.set('port', process.env.PRT || 8001)
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
passportConfig()

app.use('/', pageRouter)
app.use('/auth', authRouter)
app.use('/post', postRouter)
app.use('/user', userRouter)

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
