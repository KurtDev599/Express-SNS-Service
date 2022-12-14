const express = require('express')
const User = require('../models/user')
const Follower = require('../models/follow')

const { isLoggedIn } = require('./middlewares')
const router = express.Router()

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    if (user) {
      await user.addFollowings(parseInt(req.params.id, 10))
      res.send('success')
    } else {
      res.status(404).end()
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.delete('/:id/unfollow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    if (user) {
      await user.removeFollowing(parseInt(req.params.id, 10))
      res.send('success')
    }
  } catch (error)  {
    console.error(error)
    next(error)
  }
})

module.exports = router
