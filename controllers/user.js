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

    let bases = await Base.find({stack: user.id})

    bases.map(async (base) => {
      base.stack = base.stack.filter(d => d != user.id)
      await base.save()
    })
    

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

    let base = await Base.findOne({stack: user._id})

    sendJSONresponse(res, 200, {inService: user.inService, service, base})
  } catch(e) {
    return next(e)
  }
}

async function driver_details (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findById(driver_id, 'full_name image rating email image enable')

    sendJSONresponse(res, 200, driver)
  } catch(e) {
    return next(e)
  }
}

async function user_add_review (req, res, next) {
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

async function driver_update_image (req, res, next) {
  try {
    const user = req.user

    if (req.body.image) {
      let fileName = Date.now()
      let filepath = base64Img.imgSync(
        req.body.image,
        path.join("/home/xcero/public", "drivers"),
        //path.join("./uploads", "laboratory"),
        fileName
      )
      user.image = "http://xcero.com/images/drivers/" + fileName + path.extname(filepath)

      await user.save()
    } else {
      throw boom.badRequest('image is required')
    }

    sendJSONresponse(res, 200, {image: user.image})

  } catch(e) {
    return next(e)
  }
}

async function driver_update (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findByIdAndUpdate(driver_id, req.body, { new: true })
    delete driver.password

    sendJSONresponse(res, 200, driver)
  } catch (e) {
    return next(e)
  }
}

async function driver_leave_base (req, res, next) {
  try {
    const user = req.user

    let bases = await Base.find({stack: user.id})

    if (bases.length > 0) {
      bases.map(async (base) => {
        base.stack = base.stack.filter(d => d != user.id)
        await base.save()
      })
  
      sendJSONresponse(res, 200, {base: bases[0]})
    } else {
      sendJSONresponse(res, 200, {message: 'Conductor fuera de base.'})
    }

    
  } catch (e) {
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
  user_add_review,
  driver_update_image,
  driver_update,
  driver_leave_base
}
