const mongoose = require('mongoose')
const Schema = mongoose.Schema

const baseSchema = new Schema({
	name: { type: String, required: true },
	address: { type: String, required: true },
	coords: { type: [Number], index: "2dsphere" }
})

module.exports = mongoose.model('Base', baseSchema)
