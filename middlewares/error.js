const winston = require('winston')

module.exports = function (err, req, res, next) {
  winston.error(err.message + e.controller, err)
  
  res.status(500).send({ error: err.message })
}
