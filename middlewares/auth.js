const passportService = require('../config/components/passport')
const passport = require('passport')

const require_auth = passport.authenticate('jwt', {
  session: false
})

const require_login = passport.authenticate('local', {
  session: false
})

module.exports = {
  require_auth,
  require_login
}
