const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { User, Domain } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user && req.user.id || null },
      include: { model: Domain }
    })
    res.res('login 화면')
  } catch (err) {
    console.error(err)
    next(err)
  }
})
