const express = require('express')
const require_auth = require('../middlewares/auth').require_auth
const require_login = require('../middlewares/auth').require_login

const authenticathion_controller = require('../controllers/authentication')

const auth_routes = express.Router()

/**
 * @api {post} /api/auth/register Register user
 * @apiName Register
 * @apiGroup Authentication
   @apiParam (body) {String} email
   @apiParam (body) {String} password
   @apiParam (body) {String} account Nombre de usuario
   @apiParam (body) {String} full_name
   @apiParam (body) {String} role User

 * @apiSuccess (200 Success) {String} token
 * @apiSuccess (200 Success) {Object} user
 *
 */
auth_routes.post('/register', authenticathion_controller.register)

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Authentication
 * @apiParam (body) {String} email
 * @apiParam (body) {String} password
 * @apiSuccess (200 Success) {String} token
 * @apiSuccess (200 Success) {Object} user
 *
 */
auth_routes.post('/login', require_login, authenticathion_controller.login)
auth_routes.post('/facebook', authenticathion_controller.facebook_login)

module.exports = auth_routes
