const mongoose = require('mongoose')
const Schema = mongoose.Schema

const placeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
	coords: { type: [Number], index: "2dsphere" },
  place_id: { type: String, required: true },
  base: { type: Schema.Types.ObjectId, ref: 'Base', required: true }
})

module.exports = mongoose.model('Place', placeSchema)
