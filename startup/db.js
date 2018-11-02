const mongoose = require('mongoose')
const config = require('../config/db')

module.exports = () => {
  mongoose.Promise = require('bluebird')
  mongoose.connect(
    config.database,
    {
      useMongoClient: true,
      reconnectTries: Number.MAX_VALUE,
        // sets the delay between every retry (milliseconds)
      reconnectInterval: 1000 
    }
  )
}
