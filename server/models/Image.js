const mongoose = require('mongoose')

const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'
const ObjectId = mongoose.Schema.Types.ObjectId

let imageSchema = new mongoose.Schema({
  description: { type: String, required: REQUIRED_VALIDATION_MESSAGE, maxlength: 500 },
  url: { type: String, required: REQUIRED_VALIDATION_MESSAGE },
  author: { type: ObjectId, required: REQUIRED_VALIDATION_MESSAGE, ref: 'User' },
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  tags: [ { type: String } ],
  handles: [ { type: String } ]
})

let Image = mongoose.model('Image', imageSchema)

module.exports = Image
