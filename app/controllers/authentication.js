'use strict'

const crypto = require('crypto')
const User = require('../models/user')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const generateToken = require('../shared/common').generateToken
const setUserInfo = require('../shared/common').setUserInfo
const boom = require('boom')

function login(req, res, next) {
  let userInfo = setUserInfo(req.user)

  sendJSONresponse(res, 200, {
    token: generateToken(userInfo),
    user: userInfo
  })
}

async function register(req, res, next) {
  try {
    let userExist = await User.findOne({
      email: req.body.email
    })

    if (userExist) {
      return next(new Error('User alredy exist'))
    }

    let user = new User(req.body)

    user = await user.save()
    let userInfo = setUserInfo(user)

    sendJSONresponse(res, 200, {
      token: generateToken(userInfo),
      user: userInfo
    })
  } catch (e) {
    next(e)
  }
}

async function facebook_login(req, res, next) {
  try {
    const facebook_id = req.body.facebook_id

    if (!facebook_id) boom.badRequest('facebook_id is required')

    let user = User.findOne({
      facebook_id: facebook_id
    })
    if (user) {
      let userInfo = setUserInfo(user)
      sendJSONresponse(res, 200, {
        user: userInfo,
        token: generateToken(userInfo)
      })
      return
    }

    user = new User(req.body)
    user.image = `https://graph.facebook.com/${facebook_id}/picture?type=small`

    user = await user.save()
    let userInfo = setUserInfo(user)
    sendJSONresponse(res, 200, {
      user: userInfo,
      token: generateToken(userInfo)
    })

  } catch (e) {
    return next(e)
  }
}

module.exports = {
  login,
  register,
  facebook_login
}