const winston = require('winston')
const mongoose = require('mongoose')
const config = require('../config/db')

module.exports = () => {
  mongoose.Promise = require('bluebird')
  mongoose.connect(config.database, {
    useMongoClient: true
  })
}