const mongoose = require('mongoose')
const Image = mongoose.model('Image')

module.exports = {
  about: (req, res) => {
    res.render('home/about')
  },
  index: (req, res) => {
    Image.find()
      .populate('author')
      .sort('-date')
      .limit(100)
      .then(images => {
        for (let image of images) {
          image.views++
          image.save()
        }
        res.render('home/index', {
          images: images
        })
      })
  }
}
