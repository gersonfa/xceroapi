const mongoose = require('mongoose')
const Schema = mongoose.Schema

const areaSchema = new Schema({
    name: { type: String },
    paths: [{ lat: Number, lng: Number}],
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true }
})

module.exports = mongoose.model('Area', areaSchema)
