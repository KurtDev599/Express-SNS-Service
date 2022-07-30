const express = require('express')

const router = express.Router()

// router.use((req, res, next) => {
//   res.local.user = null
//   res.local.followerCount = 0
//   res.local.followingCount = 0
//   res.local.followerIdList = []
//   next()
// })

router.get('/profile', (req, res) => {
  res.send('내정보')
})

router.get('/join', (req, res) => {
  res.send('회원가입')
})

router.get('/', (req, res, next) => {
  const twits = [];
  res.send(twits)
})

module.exports = router
