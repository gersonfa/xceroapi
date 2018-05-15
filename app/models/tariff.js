const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tariffSchema = new Schema({
	groups: [{type: Schema.Types.ObjectId, ref: 'Group'}],
	cost: { type: Number, required: true }
})

module.exports = mongoose.model('Tariff', tariffSchema)