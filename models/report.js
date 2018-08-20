const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reportSchema = new Schema({
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true},
  reason: { type: String, required: true },
  text: { type: String },
  date: { type: Number, required: true },
  phone: { type: Number }
})

module.exports = mongoose.model('Report', reportSchema)
