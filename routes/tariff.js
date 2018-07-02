const tariff_controller = require('../controllers/tariff')
const express = require('express')
const require_auth = require('../middlewares/auth').require_auth

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
tariff_routes.get('/check', require_auth, tariff_controller.tariff_check)
tariff_routes.delete('/:tariff_id', require_auth, tariff_controller.tariff_delete)

module.exports = tariff_routes
