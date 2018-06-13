const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serviceSchema = new Schema({
  origin_coords: { type: [Number], index: "2dsphere" },
  destiny_coords: { type: [Number], index: "2dsphere" },
  driver: { type: Schema.Types.ObjectId, ref: 'User'},
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  tariff: { type: Schema.Types.ObjectId, ref: 'Tariff' },
  comment: { type: String },
  state: { type: String, enum: ['pending', 'waiting', 'on road', 'completed'], default: 'pending'},

  origin_colony: { type: Schema.Types.ObjectId, ref: 'Colony' },
  destiny_colony: { type: Schema.Types.ObjectId, ref: 'Colony'},

  origin_place: { type: Schema.Types.ObjectId, ref: 'Place'},
  destiny_place: { type: Schema.Types.ObjectId, ref: 'Place'}
})

module.exports = mongoose.model('Service', serviceSchema)
