const mongoose = require('mongoose')
const Image = mongoose.model('Image')
const User = mongoose.model('User')
// const Image = require('../models/Image')

const errorHandler = require('../utilities/error-handler')

function getHtag (str) {
  str = str.slice(str.indexOf('#'))
  let len = str.length - 1
  while (str.charAt(0) === '#' && (len >= 0)) {
    str = str.slice(1)
    len = str.length - 1
  }
  str = str.replace(/#+$/, '')
  return str
}

function getHandle (str) {
  str = str.slice(str.indexOf('@'))
  let len = str.length - 1
  while (str.charAt(0) === '@' && (len >= 0)) {
    str = str.slice(1)
    len = str.length - 1
  }
  str = str.replace(/@+$/, '')
  return str
}

module.exports = {
  addGet: (req, res) => {
    res.render('image/add')
  },
  addPost: (req, res) => {
    let description = req.body.description
    let url = req.body.url
    if (description.length > 140) {
      res.locals.globalError = `Description cannot be more than 500 characters`
      res.render('image/add', {
        description: description,
        url: url
      })
      return
    }

    let tags = []
    let handles = []
    let words = description.split(/[ .,!?]+/g)
    let len = words.length - 1
    for (let i = 0; i <= len; i++) {
      if ((words[i].length > 0) && (words[i].indexOf('#') > -1)) {
        let tag = getHtag(words[i]).toLowerCase()
        if (tag.length - 1 > -1) {
          if (!tags.includes(tag)) {
            tags.push(tag)
          }
        }
      }
      if ((words[i].length > 0) && (words[i].indexOf('@') > -1)) {
        let handle = getHandle(words[i])
        if (handle.length - 1 > -1) {
          if (!handles.includes(handle)) {
            handles.push(handle)
          }
        }
      }
    }

    let imageObj = {
      description: description,
      url: url,
      author: req.user.id,
      tags: tags,
      handles: handles
    }
    Image.create(imageObj)
    .then((image) => {
      let len = handles.length - 1
      for (let i = 0; i <= len; i++) {
        let handledUser = handles[i]
        User.findOne({ username: `${handledUser}` })
          .then(user => {
            if (user) {
              Image.create({
                description: imageObj.description,
                url: imageObj.url,
                author: user.id,
                tags: imageObj.tags
                // ,
                // handles: imageObj.handles
              })
              .then(image => {
              })
              .catch(err => {
                console.log(errorHandler.handleMongooseError(err))
              })
            }
          })
      }
      res.redirect('/')
    })
    .catch(err => {
      res.locals.globalError = errorHandler.handleMongooseError(err)
      res.redirect('/')
    })
  },
  editGet: (req, res) => {
    let id = req.params.id
    Image.findById(id)
      .then(image => {
        res.render('image/edit', {
          image: image
        })
      })
  },
  editPost: (req, res) => {
    let id = req.params.id
    let description = req.body.description
    let url = req.body.url

    let tags = []
    let handles = []
    let words = description.split(/[ .,!?]+/g)
    let len = words.length - 1
    for (let i = 0; i <= len; i++) {
      if ((words[i].length > 0) && (words[i].indexOf('#') > -1)) {
        let tag = getHtag(words[i]).toLowerCase()
        if (tag.length - 1 > -1) {
          if (!tags.includes(tag)) {
            tags.push(tag)
          }
        }
      }
      if ((words[i].length > 0) && (words[i].indexOf('@') > -1)) {
        let handle = getHandle(words[i])
        if (handle.length - 1 > -1) {
          if (!handles.includes(handle)) {
            handles.push(handle)
          }
        }
      }
    }

    Image.findById(id)
      .then(image => {
        image.description = description
        image.url = url
        image.tags = tags
        image.handles = handles
        image.save()
        .then((t) => {
          res.redirect('/')
        })
        .catch(err => {
          res.locals.globalError = errorHandler.handleMongooseError(err)
          res.redirect('/')
        })
      })
  },
  deleteGet: (req, res) => {
    let id = req.params.id

    Image.findById(id)
      .then(image => {
        res.render('image/delete', {
          image: image
        })
      })
  },
  deletePost: (req, res) => {
    let id = req.params.id

    Image.findByIdAndRemove(id)
      .then(() => {
        res.redirect('/')
      })
      .catch(err => {
        res.locals.globalError = errorHandler.handleMongooseError(err)
        res.redirect('/')
      })
  },
  like: (req, res) => {
    let id = req.params.id
    Image.findById(id)
      .then(image => {
        image.likes = image.likes + 1
        image.save()
          .then(image => {
            User.findByIdAndUpdate(req.user.id, {
              $addToSet: { likedItems: image.id }
            })
            .then(() => {
              res.redirect('/')
            })
          })
      })
  },
  dislike: (req, res) => {
    let id = req.params.id
    Image.findById(id)
      .then(image => {
        image.likes = image.likes - 1
        image.save()
          .then(image => {
            User.findByIdAndUpdate(req.user.id, {
              $pull: { likedItems: { $in: [image.id] } }
            })
            .then(() => {
              res.redirect('/')
            })
          })
      })
  },
  showByTagName: (req, res) => {
    let tagName = req.params.tagName

    Image.find({
      tags: { $in: [tagName] }
    })
    .populate('author')
    .sort('-date')
    .limit(100)
    .then(images => {
      for (let image of images) {
        image.views++
        image.save()
      }
      res.render(`image/tag`, {
        images: images,
        tagName: tagName
      })
    })
  }
}
