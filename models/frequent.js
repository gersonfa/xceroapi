const mongoose = require('mongoose')
const Schema = mongoose.Schema

const frequentSchema = new Schema({
    name: { type: String },
    coords: { type: [Number], index: "2dsphere" },
    address: { type: String },
    user: { type: Schema.Types.ObjectId }
})

module.exports = mongoose.model('frequent', frequentSchema)