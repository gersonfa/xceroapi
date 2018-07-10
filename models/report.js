const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reportSchema = new Schema({
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  text: { type: String }
})

module.exports = mongoose.model('Report', reportSchema)
