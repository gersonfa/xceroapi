const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noticeSchema = new Schema({
    date: { type: Number },
    body: { type: String }
})

module.exports = mongoose.model('Notice', noticeSchema)
