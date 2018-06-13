const router = require('../routes/index')
const error = require('../middlewares/error')

module.exports = function(app, io) {
  router(app, io)
  app.use(error)
}
