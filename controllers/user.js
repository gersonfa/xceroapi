'use strict'

const User = require('../models/user')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Base = require('../models/base')
const Service = require('../models/service')
const boom = require('boom')

async function user_drivers_list(req, res, next) {
  try {

    let drivers = await User.find({role: 'Driver'}, 'email full_name rating image unit_number inService')

    sendJSONresponse(res, 200, drivers)
  } catch (e) {
    return next(e)
  }
}

async function drivers_location (req, res, next) {
  try {
    let drivers = await User.find({role: 'Driver'}, 'coords full_name unit_number')

    sendJSONresponse(res, 200, drivers)
  } catch (e) {
    return next(e)
  }
}

async function driver_exit (req, res, next) {
  try {
    const user = req.user

    let base = await Base.findOne({stack: user.id})
    
    if (base) {
      base.stack = base.stack.filter(d => d != user.id)
      await base.save()
    }

    user.inService = true
    await user.save()

    sendJSONresponse(res, 200, {message: 'Conductor fuera de servicio o trabajando por fuera.'})
  } catch(e) {
    return next(e)
  }
}

async function driver_in (req, res, next) {
  try {
    const user = req.user
    user.inService = false

    await user.save()
    sendJSONresponse(res, 200, {message: 'Conductor habilitado para nuevos servicios.'})
  } catch(e) {
    return next(e)
  }
}

async function user_status (req, res, next) {
  try {
    const user = req.user

    let service = await Service.findOne({
      $or: [{driver: user._id}, {user: user._id}], 
      state: {$in: ['on_the_way', 'in_process', 'pending']}})
      .populate('origin_colony destiny_colony origin_place destiny_place')
      .populate({path: 'user', select: 'full_name image'})
      .populate({path: 'driver', select: 'full_name image rating unit_number'})

    sendJSONresponse(res, 200, {inService: user.inService, service})
  } catch(e) {
    return next(e)
  }
}

async function driver_details (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findById(driver_id, 'full_name image rating email image')

    sendJSONresponse(res, 200, driver)
  } catch(e) {
    return next(e)
  }
}

async function driver_add_review (req, res, next) {
  try {
    const user = req.user
    const driver_id = req.params.driver_id

    if (!req.body.rating) throw boom.badRequest('rating is required')

    let driver = await User.findById(driver_id)

    let review = {
      user: user._id,
      rating: req.body.rating,
      comment: req.body.comment
    }

    driver.reviews.push(review)

    let total = 0
    driver.reviews.map(r => total += r.rating)
    driver.rating = total / driver.reviews.length

    await driver.save()

    sendJSONresponse(res, 201, review)
  } catch(e) {
    return next(e)
  }
}

module.exports = {
  user_drivers_list,
  drivers_location,
  driver_exit,
  driver_in,
  user_status,
  driver_details,
  driver_add_review
}
