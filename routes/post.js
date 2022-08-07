const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { Post, Hashtag } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

try {
  fs.readdirSync('uploads')
} catch (error) {
  console.error('upload 폴더가 없어 upload 폴더 생성')
  fs.mkdirSync('uploads')
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cd) {
      cd(null, 'uploads')
    },
    filename(req, file, cd) {
      const ext = path.extname(file.originalname)
      cd(null, path.basename(file.originalname, ext) + Date.now() + ext)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
})

router.post('/image', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file)
  // 이미지 먼저 등록 후 img url response 넘김
  // 프론트에서 글 작성후 response 로 받은 img url 'POST /post' 요청시 request body 넣어서 보내야 함
  res.json({ url: `/img${req.file.filename}` })
})

// const upload2 = multer()
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id
    })
    const hashtags = req.body.content.match(/#[^\s#]*/g)
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() }
          })
        })
      )
    }
    res.redirect('/')
  } catch (error) {
    console.error(error)
    next(error)
  }
})

module.exports = router
