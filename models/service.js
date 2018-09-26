const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feeSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, {
  usePushEach: true
})

const serviceSchema = new Schema({
  origin_coords: { type: [Number], index: "2dsphere" },
  destiny_coords: { type: [Number], index: "2dsphere" },

  driver: { type: Schema.Types.ObjectId, ref: 'User'},
  user: { type: Schema.Types.ObjectId, ref: 'User' },

  tariff: { type: Schema.Types.ObjectId, ref: 'Tariff' },
  address: { type: String },
  state: { type: String, enum: ['pending', 'on_the_way', 'in_process', 'completed', 'canceled', 'negated'], default: 'pending'},

  origin_colony: { type: Schema.Types.ObjectId, ref: 'Colony' },
  destiny_colony: { type: Schema.Types.ObjectId, ref: 'Colony'},

  origin_place: { type: Schema.Types.ObjectId, ref: 'Place'},
  destiny_place: { type: Schema.Types.ObjectId, ref: 'Place'},

  origin_group: { type: Schema.Types.ObjectId, ref: 'Group'},
  destiny_group: { type: Schema.Types.ObjectId, ref: 'Group'},

  start_time: { type: Number },
  end_time: { type: Number },

  request_time: { type: Number },
  negated_time: { type: Number },
  canceled_time: { type: Number },

  fees: [feeSchema],
  price: { type: Number }, // Precio que asigna el conductor si no se encuentra tarifa
  details: { type: String }, // Dirección origen
  destiny_details: { type: String }, // Dirección destino
  reason_negated: { type: String } // Razón por la que un taxista nego el servicio
}, {
  usePushEach: true
})

module.exports = mongoose.model('Service', serviceSchema)
