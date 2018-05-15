'use strict'

const jwt = require('jsonwebtoken')
const config = require('../../config/config')

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

module.exports = {
  sendJSONresponse,
  generateToken,
  setUserInfo
}