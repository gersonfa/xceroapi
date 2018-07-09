'use strict'

const User = require('../models/user')
const sendJSONresponse = require('../shared/common').sendJSONresponse

async function user_drivers_list(req, res, next) {
  try {

    let drivers = await User.find({role: 'Driver'}, 'email full_name rating image unit_number')

    sendJSONresponse(res, 200, drivers)
  } catch (e) {
    return next(e)
  }
}

async function drivers_location (req, res, next) {
  try {
    let drivers = await User.find({role: 'Driver'}, 'coords full_name')

    sendJSONresponse(res, 200, drivers)
  } catch (e) {
    return next(e)
  }
}

module.exports = {
  user_drivers_list,
  drivers_location
}
