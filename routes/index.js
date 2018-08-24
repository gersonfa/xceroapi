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
  const inbox_controller = require('../controllers/inbox')(io, users_online)
  const report_controller = require('../controllers/report')
  const frequent_controller = require('../controllers/frequent')
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
  api_routes.delete('/base/:base_id/place/:place_id', require_auth, place_controller.place_delete)

  api_routes.post('/base/:base_id/group', require_auth, group_controller.group_create)
  api_routes.delete('/base/:base_id/group/:group_id', require_auth, group_controller.group_delete)
  api_routes.get('/base/:base_id/group', require_auth, group_controller.group_by_base)

  api_routes.get('/group/place', require_auth, group_controller.group_place_list)
  api_routes.get('/group/place/available', require_auth, group_controller.group_place_available)

  api_routes.post('/group/:group_id/colony', require_auth, colony_controller.colony_create)
  api_routes.get('/group/:group_id/colony', require_auth, colony_controller.colony_by_group)
  api_routes.delete('/colony/:colony_id', require_auth, colony_controller.colony_delete)

  api_routes.post('/driver/:driver_id/inbox', require_auth, inbox_controller.inbox_create)
  /**
   * @api {get} /api/diver/:driver_id/inbox Inbox list
   * @apiName Inbox list
   * @apiGroup Inbox
   * @apiPermission Token

   * @apiSuccess (200 Success) {Object[]} inbox Array de inbox
   * @apiSuccess (200 Success) {String} inbox._id
   * @apiSuccess (200 Success) {String} body
   * @apiSuccess (200 Success) {Number} date
   */
  api_routes.get('/driver/:driver_id/inbox', require_auth, inbox_controller.inbox_list)
  api_routes.post('/notice', require_auth, inbox_controller.notice_create)
  /**
   * @api {get} /api/notice Notice list
   * @apiName Notice list
   * @apiGroup Notice
   * @apiPermission Token

   * @apiSuccess (200 Success) {Object[]} Notice Array de notice
   * @apiSuccess (200 Success) {String} body
   * @apiSuccess (200 Success) {Number} date
   */
  api_routes.get('/notice', require_auth, inbox_controller.notice_list)
  api_routes.delete('/notice/:notice_id', require_auth, inbox_controller.notice_delete)

  /**
   * @api {get} /api/colony Colony list
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
   * @api {put} /api/user/driver_exit Exit from app
   * @apiName Exit from app
   * @apiGroup Drivers
   * @apiPermission Token

   * @apiSuccess (200 Success) message
   */
  api_routes.put('/user/driver_exit', require_auth, user_controller.driver_exit)
  /**
   * @api {put} /api/user/driver_in Enter to app
   * @apiName Enter to app
   * @apiGroup Drivers
   * @apiPermission Token

   * @apiSuccess (200 Success) message
   */
  api_routes.put('/user/driver_in', require_auth, user_controller.driver_in)
  /**
   * @api {get} /api/user/user_status Check user status
   * @apiName User status
   * @apiGroup User
   * @apiPermission Token

   * @apiSuccess (200 Success) inService boolean
   * * @apiSuccess (200 Success) service service object if exist
   */
  api_routes.get('/user/user_status', require_auth, user_controller.user_status)
  /**
   * @api {put} /api/user/driver_leave_base Leave base
   * @apiName Leave base
   * @apiGroup Drivers
   * @apiPermission Token

   * @apiSuccess (200 Success) base
   */
  api_routes.put('/user/driver_leave_base', require_auth, user_controller.driver_leave_base)
  /**
   * @api {put} /api/user/change_password Change password
   * @apiName Change password
   * @apiGroup User
   * @apiPermission Token
   * @apiParam (body) {string} old_password Contraseña actual
   * @apiParam (body) {string} new_password Nueva contraseña
   * @apiSuccess (200 Success) message
   */
  api_routes.put('/user/change_password', require_auth, user_controller.user_change_password)
  /**
   * @api {post} /api/user/new_password New password
   * @apiName New password
   * @apiGroup User
   * @apiParam (body) {string} email Email de usuario
   * @apiSuccess (200 Success) message
   */
  api_routes.post('/user/new_password', user_controller.user_new_password)
  api_routes.get('/user/:driver_id/driver_details', require_auth, user_controller.driver_details)
  api_routes.get('/user/:driver_id/reviews', require_auth, user_controller.driver_reviews)
  api_routes.put('/user/:driver_id/driver_update', require_auth, user_controller.driver_update)
  api_routes.delete('/driver/:driver_id/delete', require_auth, user_controller.driver_delete)
  /**
   * @api {put} /api/user/update_image Update image
   * @apiName Update image
   * @apiGroup Drivers
   * @apiPermission Token

   * @apiSuccess (200 Success) image imagen en base64
   */
  api_routes.put('/user/update_image', require_auth, user_controller.driver_update_image)
  /**
   * @api {post} /api/user/:user_id/add_review Review create
   * @apiName Review create
   * @apiGroup User
   * @apiPermission Token
   * @apiParam (body) {Number} rating Calificación del 1 al 5
   * @apiParam (body) {String} comment comentario (Opcional)

   * @apiSuccess (200 Success) Object service
   */
  api_routes.post('/user/:driver_id/add_review', require_auth, user_controller.user_add_review)
  /**
   * @api {post} /api/user/:user_id/add_review Emergency enable
   * @apiName Emergency enable
   * @apiGroup User
   * @apiDescription se le envia un socket a los conductores cercanos 'emergency'
   * @apiPermission Token
   * @apiParam (query) {String} service_id En caso de ser un cliente, mandar service_id

   * @apiSuccess (200 Success) emergency boolean
   */
  api_routes.post('/emergency_enable', require_auth, service_controller.emergency_enable)
  /**
   * @api {post} /api/user/:user_id/add_review Emergency disable
   * @apiName Emergency disable
   * @apiGroup User
   * @apiPermission Token
   * @apiDescription Solo lo puede desactivar el conductor o la administración

   * @apiSuccess (200 Success) emergency boolean
   */
  api_routes.post('/emergency_disable', require_auth, service_controller.emergency_disable)
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
   * @apiParam (body) start_time getTime del objeto date
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
   * @apiParam (body) end_time getTime del objeto date
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
   * @api {put} /api/service/:service_id/negate Service negate
   * @apiName Service negate
   * @apiGroup Service
   * @apiPermission Token

   * @apiSuccess (200 Success) Object service
   */
  api_routes.put('/service/:service_id/negate', require_auth, service_controller.service_negate)
  /**
   * @api {put} /api/service/:service_id/service_reject Service reject
   * @apiName Service reject
   * @apiGroup Service
   * @apiPermission Token

   * @apiSuccess (200 Success) messge servicio asignado a otro conductor
   */
  api_routes.put('/service/:service_id/service_reject', require_auth, service_controller.service_reject)
  /**
   * @api {post} /api/service/:service_id/fee Set fee
   * @apiName Set fee
   * @apiGroup Service
   * @apiPermission Token

   * @apiParam (body) {String} name Nombre de cuota
   * @apiParam (body) {Number} price Precio de cuota
   * @apiSuccess (200 Success) Object 
   */
  api_routes.post('/service/:service_id/fee', require_auth, service_controller.add_fee)
  /**
   * @api {delete} /api/service/:service_id/fee/:fee_id Remove fee
   * @apiName Remove fee
   * @apiGroup Service
   * @apiPermission Token

   * @apiParam (param) {String} fee_id Id de cuota
   * @apiSuccess (200 Success) Object 
   */
  api_routes.delete('/service/:service_id/fee/:fee_id', require_auth, service_controller.remove_fee)
  /**
   * @api {put} /api/service/:service_id/price Set price
   * @apiName Set price
   * @apiGroup Service
   * @apiPermission Token

   * @apiParam (body) {Number} price Precio establecido por el conductor
   * @apiSuccess (200 Success) price 
   */
  api_routes.put('/service/:service_id/price', require_auth, service_controller.add_price)
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
   * @api {get} /api/driver_location/:driver_id Get driver location
   * @apiName Get driver location
   * @apiGroup Service
   * @apiDescription Esta ruta es para obtener la ubicación del conductor para que se muestre en el mapa en el transcurso del viaje.
   * @apiPermission Token

   * @apiSuccess (200 Success) {String} unit_number número de unidad
   * @apiSuccess (200 Success) {Array} coords coordenadas
   */
  api_routes.get('/driver_location/:driver_id', require_auth, user_controller.driver_location)
  api_routes.get('/service/driver/:driver_id', require_auth, service_controller.service_by_driver)
  /**
   * @api {post} /api/report Report create
   * @apiName Report create
   * @apiGroup Report
   * @apiPermission Token
   * @apiParam (body) {String} reason
   * @apiParam (body) {String} text commentario opcional
   * @apiParam (body) {Number} date gatTime del objeto date
   * @apiParam (body) {String} service id del servicio
   * @apiParam (body) {String} driver id del conductor

   * @apiSuccess (200 Success) Object service
   */
  api_routes.post('/report', require_auth, report_controller.report_create)
  api_routes.get('/report', require_auth, report_controller.report_list)
  api_routes.get('/report/:driver_id', require_auth, report_controller.report_driver_list)

  /**
   * @api {post} /api/frequent Frequent create
   * @apiName Frequent create
   * @apiGroup Frequent
   * @apiPermission Token
   * @apiParam (body) {String} name
   * @apiParam (body) {String} address 
   * @apiParam (body) {Number} lat 
   * @apiParam (body) {Number} lng

   * @apiSuccess (200 Success) Object frequent
   */
  api_routes.post('/frequent', require_auth, frequent_controller.frequent_create)
  /**
   * @api {get} /api/frequent Frequent list
   * @apiName Frequent list
   * @apiGroup Frequent
   * @apiPermission Token

   * @apiSuccess (200 Success) [frequent] frequents
   */
  api_routes.get('/frequent', require_auth, frequent_controller.frequent_list)
  /**
   * @api {post} /api/frequent/:frequent_id Frequent update
   * @apiName Frequent update
   * @apiGroup Frequent
   * @apiPermission Token
   * @apiParam (body) {String} name
   * @apiParam (body) {String} address 
   * @apiParam (body) {Number} lat 
   * @apiParam (body) {Number} lng

   * @apiSuccess (200 Success) Object frequent
   */
  api_routes.put('/frequent/:frequent_id', require_auth, frequent_controller.frequent_update)
  /**
   * @api {post} /api/frequent/:frequent_id Frequent delete
   * @apiName Frequent delete
   * @apiGroup Frequent
   * @apiPermission Token

   * @apiSuccess (200 Success) Object frequent
   */
  api_routes.delete('/frequent/:frequent_id', require_auth, frequent_controller.frequent_delete)

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
   * @api {get} /api/service_canceled service canceled
   * @apiName service canceled
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

  /**
   * @api {get} /service_rejected service rejected
   * @apiName Service rejected
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

 /**
   * @api {get} /service_end service end
   * @apiName Service end
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

  /**
   * @api {get} /inbox new inbox
   * @apiName New inbox
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

  /**
   * @api {get} /notice new notice
   * @apiName new notice
   * @apiGroup UserSockets
   * @apiSuccess (200 Success) Object service
  */

  app.use('/api', api_routes)
}
