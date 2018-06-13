'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config/config')

function sendJSONresponse (res, status, content) {
  res.status(status).json(content)
}

function generateToken(user) {
  return jwt.sign(user, config.secret, {})
}

function setUserInfo(user) {
  const userInfo = {
    _id: user._id,
    email: user.email,
    account: user.account,
    name: user.name,
    role: user.role
  }

  return userInfo
}

const theEarth = (function () {
  const getMetersFromKilometers = function (km) {
    return parseFloat(km * 1000)
  }

  const getKilometersFromMeters = function (m) {
    return parseFloat(m / 1000)
  }

  return {
    getMetersFromKilometers,
    getKilometersFromMeters
  }
})()

module.exports = {
  sendJSONresponse,
  generateToken,
  setUserInfo,
  theEarth
}
