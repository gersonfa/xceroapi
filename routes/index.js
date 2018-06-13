module.exports = (app, io) => {
  const express = require('express')
  const multer = require('multer')

  let users_online = new Map()

  const require_auth = require('../middlewares/auth').require_auth
  const require_login = require('../middlewares/auth').require_login

  const user_controller = require('../controllers/user')
  const base_controller = require('../controllers/base')
  const group_controller = require('../controllers/group')
  const colony_controller = require('../controllers/colony')
  const place_controller = require('../controllers/place')
  const service_controller = require('../controllers/service')

  require('../controllers/socket')(io, users_online)

  const auth_routes = require('./auth')
  const tariff_routes = require('./tariff')

  const api_routes = express.Router()

  api_routes.use('/auth', auth_routes)
  api_routes.use('/tariff', tariff_routes)

  /**
   * @api {get} /place Place list
   * @apiName Place list
   * @apiGroup Place
   * @apiPermission Token

   * @apiSuccess (200 Success) {Object[]} places Array de places puto fat
   * @apiSuccess (200 Success) {String} places.name Nombre lugar.
   *
   */
  api_routes.get('/place', require_auth, place_controller.place_list)
  api_routes.get('/group', require_auth, group_controller.group_list)

  api_routes.post('/base', require_auth, base_controller.base_create)
  api_routes.get('/base', require_auth, base_controller.base_list)
  api_routes.delete('/base/:base_id', require_auth, base_controller.base_delete)

  api_routes.post('/base/:base_id/place', require_auth, place_controller.place_create)
  api_routes.get('/base/:base_id/place', require_auth, place_controller.place_by_base)

  api_routes.post('/base/:base_id/group', require_auth, group_controller.group_create)
  api_routes.get('/base/:base_id/group', require_auth, group_controller.group_by_base)

  api_routes.get('/group/place', require_auth, group_controller.group_place_list)
  api_routes.get('/group/place/available', require_auth, group_controller.group_place_available)

  api_routes.post('/group/:group_id/colony', require_auth, colony_controller.colony_create)
  api_routes.get('/group/:group_id/colony', require_auth, colony_controller.colony_by_group)

  /**
   * @api {get} /api/group/place Colony list
   * @apiName Colony list
   * @apiGroup Colony
   * @apiPermission Token

   * @apiSuccess (200 Success) {Object[]} colonies Array de colonias
   * @apiSuccess (200 Success) {String} colonies._id
   * @apiSuccess (200 Success) {String} colonies.name
   */
  api_routes.get('/colony', require_auth, colony_controller.colony_list)

  api_routes.get('/user/drivers', require_auth, user_controller.user_drivers_list)

  api_routes.post('/service', require_auth, service_controller.service_create)
  /**
   * @api {get} /api/service Service list
   * @apiName Service list
   * @apiGroup Service
   * @apiPermission Token
   * @apiParam (query) {String} state Por defecto es 'complete'

   * @apiSuccess (200 Success) {Object[]} services Array de colonias
   * @apiSuccess (200 Success) {String} services._id
   */
  api_routes.get('/service', require_auth, service_controller.service_list)

  app.use('/api', api_routes)
}
