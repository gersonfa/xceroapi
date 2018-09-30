const mongoose = require('mongoose')
const Schema = mongoose.Schema

const colonySchema = new Schema({
  name: { type: String },
  place_id: { type: String, unique: true, required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  coords: { type: [Number], index: '2dsphere' }
})

module.exports = mongoose.model('Colony', colonySchema)
