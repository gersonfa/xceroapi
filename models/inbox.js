const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  body: { type: String, required: true },
  date: { type: Number },
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Message', messageSchema)
