const mongoose = require('mongoose')
const config = require('../config/db')

module.exports = () => {
  mongoose.Promise = require('bluebird')
  mongoose.connect(
    config.test,
    {
      useMongoClient: true
    }
  )
}
