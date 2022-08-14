const express = require('express')
const {raw} = require("express");
const User = require('../models/user')
const Post = require('../models/post')
const Hashtag = require('../models/hashtag')

const router = express.Router()

router.use((req, res, next) => {
  res.locals.user = req.user
  // res.local.followerCount = 0
  // res.local.followingCount = 0
  // res.local.followerIdList = []
  next()
})

router.get('/profile', (req, res) => {
  res.send('내정보')
})

router.get('/join', (req, res) => {
  res.send('회원가입')
})

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick']
      },
      order: [['createdAt', 'DESC']]
    })
    res.send({
      title: 'sns',
      twist: posts
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.get('/hashtag', async(req, res, next) => {
  const query = decodeURIComponent(req.query.hashtag)
  if (!query) {
    return res.redirect('/')
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } })
    let posts = []
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] })
    }
    return res.send({ title: query, twits: posts })
  } catch (error) {
    console.error(error)
    next(error)
  }
})

module.exports = router
