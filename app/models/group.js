const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new Schema({
	name: { type: String },
	base: { type: Schema.Types.ObjectId, ref: 'base', required: true }
})

module.exports = mongoose.model('Group', groupSchema)