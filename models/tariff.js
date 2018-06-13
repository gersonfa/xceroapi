const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tariffSchema = new Schema({
	origin_group: { type: Schema.Types.ObjectId, ref: 'Group'},
	origin_place: { type: Schema.Types.ObjectId, ref: 'Place'},
	destiny_group: { type: Schema.Types.ObjectId, ref: 'Group' },
	destiny_place: { type: Schema.Types.ObjectId, ref: 'Place' },
	cost: { type: Number, required: true }
})

module.exports = mongoose.model('Tariff', tariffSchema)
