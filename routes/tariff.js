const tariff_controller = require('../controllers/tariff')
const express = require('express')
const require_auth = require('../middlewares/auth').require_auth
const RateLimit = require('express-rate-limit')

const checkTariffLimiter = new RateLimit({
    windowMs: 60*60*1000, // 1 hour window
    max: 3, // start blocking after 3 requests
    message: "Máximo 3 tarifas por hora.",
    keyGenerator: function (req /*, res*/) {
      return req.user._id;
    }
  })

const tariff_routes = express.Router()

tariff_routes.post('/', require_auth, tariff_controller.tariff_create)
tariff_routes.get('/', require_auth, tariff_controller.tariff_list)
/**
 * @api {get} /api/tariff/check Check Tariff
 * @apiName Check Tariff
 * @apiGroup Tariff
 * @apiParam (query) {String} colony_one
 * @apiParam (query) {String} colony_two
 * @apiParam (query) {String} place_one
 * @apiParam (query) {String} place_two

 * @apiSuccess (200 Success) {Object} tariff
 * @apiSuccess (200 Success) {Number} tariff.cost
 *
 */
tariff_routes.get('/check', require_auth, checkTariffLimiter, tariff_controller.tariff_check)
tariff_routes.get('/check/admin', require_auth, tariff_controller.tariff_check)
tariff_routes.delete('/:tariff_id', require_auth, tariff_controller.tariff_delete)
tariff_routes.put('/:tariff_id', require_auth, tariff_controller.tariff_update)
tariff_routes.put('/update/all', require_auth, tariff_controller.tariff_update_all)
tariff_routes.get('/groups/:group1_id/:group2_id', require_auth, tariff_controller.tariff_by_groups)
tariff_routes.get('/:tariff_id', require_auth, tariff_controller.tariff_details)

module.exports = tariff_routes
