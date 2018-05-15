module.exports = (app) => {
  const express = require('express')
  const passportService = require('../../config/components/passport')
  const passport = require('passport')
  const multer = require('multer')

  const authenticathion_controller = require('../controllers/authentication')
  const base_controller = require('../controllers/base')
  const group_controller = require('../controllers/group')
  const colony_controller = require('../controllers/colony')
  const tariff_controller = require('../controllers/tariff')

  const require_auth = passport.authenticate('jwt', {
    session: false
  })

  const require_login = passport.authenticate('local', {
    session: false
  })

  const api_routes = express.Router()
  const auth_routes = express.Router()

  api_routes.use('/auth', auth_routes)
  auth_routes.post('/register', authenticathion_controller.register)
  auth_routes.post('/login', require_login, authenticathion_controller.login)
  auth_routes.post('/facebook', authenticathion_controller.facebook_login)

  api_routes.post('/base', require_auth, base_controller.base_create)
  api_routes.get('/base', require_auth, base_controller.base_list)
  api_routes.delete('/base/:base_id', require_auth, base_controller.base_delete)

  api_routes.post('/base/:base_id/group', require_auth, group_controller.group_create)
  api_routes.get('/base/:base_id/group', require_auth, group_controller.group_by_base)
  api_routes.get('/group', require_auth, group_controller.group_list)
  api_routes.get('/group/:group_id/available', require_auth, group_controller.group_list_available)

  api_routes.post('/group/:group_id/colony', require_auth, colony_controller.colony_create)
  api_routes.get('/group/:group_id/colony', require_auth, colony_controller.colony_by_group)

  api_routes.post('/tariff', require_auth, tariff_controller.tariff_create)
  api_routes.get('/tariff', require_auth, tariff_controller.tariff_list)

  app.use('/api', api_routes)
}