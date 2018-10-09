const mongoose = require('mongoose')
const Schema = mongoose.Schema

const counter = new Schema({
  date: { type: Number },
  count: { type: Number, default: 0 }
})

module.exports = mongoose.model('Counter', counter)
