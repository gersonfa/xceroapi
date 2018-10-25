const mongoose = require('mongoose')
const Schema = mongoose.Schema

const analysisSchema = new Schema({
  type: { type: String, enum: ['base', 'closest']},
  drivers: [{ driver: {type: Schema.Types.ObjectId, ref: 'User'}, coords: [Number]}],
  service: { type: Schema.Types.ObjectId, ref: 'Service'}
})

module.exports = mongoose.model('analysis', analysisSchema)
