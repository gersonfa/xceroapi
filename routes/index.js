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
  const service_controller = require('../controllers/service')(io, users_online)

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
  api_routes.get('/base/:base_id', require_auth, base_controller.base_details)
  api_routes.delete('/base/:base_id', require_auth, base_controller.base_delete)
  api_routes.put('/base/empty_stack/:base_id', require_auth, base_controller.base_empty_stack)

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
  api_routes.get('/user/location', require_auth, user_controller.drivers_location)
  /**
   * @api {post} /api/service Service create
   * @apiName Service create
   * @apiGroup Service
   * @apiPermission Token
   * @apiParam (body) {Number} origin_lat Latitud de origen
   * @apiParam (body) {Number} origin_lng Longitud de origen
   * @apiParam (body) {String} origin_place id de origen de un objeto place (Opcional)
   * @apiParam (body) {String} destiny_place id de destino de un objeto place (Opcional)
   * @apiParam (body) {String} origin_colony id de origen de un objeto colony (Opcional)
   * @apiParam (body) {String} destiny_colony id de origen de un objeto colony (Opcional)

   * @apiSuccess (200 Success) Object service
   */
  api_routes.post('/service', require_auth, service_controller.service_create)
  /**
   * @api {get} /api/service Service list
   * @apiName Service list
   * @apiGroup Service
   * @apiPermission Token
   * @apiParam (query) {String} state Por defecto es 'complete'

   * @apiSuccess (200 Success) {Object[]} services
   */
  api_routes.get('/service', require_auth, service_controller.service_list)
  /**
   * @api {put} /api/service/:service_id/accept Service accept
   * @apiName Service accept
   * @apiGroup Service
   * @apiPermission Token

   * @apiSuccess (200 Success) Object service updated
   */
  api_routes.put('/service/:service_id/accept', require_auth, service_controller.service_set_driver)
  /**
   * @api {put} /api/service/:service_id/start Service start
   * @apiName Service start
   * @apiGroup Service
   * @apiPermission Token

   * @apiSuccess (200 Success) Object service updated
   */
  api_routes.put('/service/:service_id/start', require_auth, service_controller.service_start)
  /**
   * @api {put} /api/service/:service_id/end Service end
   * @apiName Service end
   * @apiGroup Service
   * @apiPermission Token
   * @apiParam (body) {Number} destiny_lat Latitud de origen
   * @apiParam (body) {Number} destiny_lng Longitud de origen

   * @apiSuccess (200 Success) Object service
   */
  api_routes.put('/service/:service_id/end', require_auth, service_controller.service_end)
  /**
   * @api {put} /api/service/:service_id/cancel Service cancel
   * @apiName Service cancel
   * @apiGroup Service
   * @apiPermission Token

   * @apiSuccess (200 Success) Object service
   */
  api_routes.put('/service/:service_id/cancel', require_auth, service_controller.service_cancel)
  /**
   * @api {get} /api/get_location Get location
   * @apiName Get location
   * @apiGroup Service
   * @apiPermission Token
   * @apiParam (query) {String} origin_lng Longitud
   * @apiParam (query) {String} origin_lat Latitud

   * @apiSuccess (200 Success) object {place: object} devuelve un lugar si se encontro
   * @apiSuccess (200 Success) object {colony:object} devuelve la colonia si se encontro
   */
  api_routes.get('/get_location', require_auth, service_controller.get_location)

  /**
   * @api {post} /update_location update location
   * @apiName Update location
   * @apiGroup DriverSockets
   * @apiParam (body) Object {user_id: user_id, coords: [lng, lat]}
  */

  /**
   * @api {get} /added added to base
   * @apiName Added to base
   * @apiGroup DriverSockets
   * @apiSuccess (200 Success) Object {base: String, position: Number}
  */

  /**
   * @api {get} /api/new_service new service
   * @apiName New service
   * @apiGroup DriverSockets
   * @apiSuccess (200 Success) Object service
  */

  /**
   * @api {get} /service_on_the_way service on the way
   * @apiName Service on the way
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

  /**
   * @api {get} /service_started service started
   * @apiName Service started
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

  app.use('/api', api_routes)
}
