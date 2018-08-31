'use strict'

const User = require('../models/user')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Base = require('../models/base')
const bcrypt = require('bcrypt-nodejs')
const Service = require('../models/service')
const boom = require('boom')
const email_sender = require('../utils/email')
const base64Img = require('base64-img')
const path = require('path')

async function user_drivers_list(req, res, next) {
  try {

    let drivers = await User.find({role: 'Driver'}, 'email full_name rating image unit_number inService')

    sendJSONresponse(res, 200, drivers)
  } catch (e) {
    return next(e)
  }
}

function drivers_location (users) {
  return async (req, res, next) => {
    try {
      let user_ids = Array.from(users.keys());

      let drivers = await User.find({role: 'Driver', _id: { $in: user_ids }}, 'coords full_name unit_number emergency')
  
      sendJSONresponse(res, 200, drivers)
    } catch (e) {
      return next(e)
    }
  }
}

async function driver_location (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findById(driver_id, 'coords unit_number emergency')

    sendJSONresponse(res, 200, driver)
  } catch(e) {
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

    sendJSONresponse(res, 200, {inService: user.inService, service, base, emergency: user.emergency})
  } catch(e) {
    return next(e)
  }
}

async function driver_details (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findById(driver_id, 'full_name image rating email image enable unit_number account emergency')

    sendJSONresponse(res, 200, driver)
  } catch(e) {
    return next(e)
  }
}

async function driver_reviews (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let driver = await User.findById(driver_id).populate({path: 'reviews.author', select: 'full_name'})
    let reviews = driver.reviews.filter(r => r.comment)

    sendJSONresponse(res, 200, reviews)
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
    let driver = req.body

    let old_driver = await User.findById(driver_id)

    if (driver.image && (driver.image != old_driver.image)) {
      let fileName = Date.now()
      let filepath = base64Img.imgSync(
        driver.image,
        path.join("/home/images", "profile"),
        //path.join("./uploads", "laboratory"),
        fileName
      )
      driver.image = "http://45.56.121.162/images/profile/" + fileName + path.extname(filepath)
    }

    old_driver = Object.assign(old_driver, driver)
    await old_driver.save()
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

async function user_change_password (req, res, next) {
  try {
    let user = req.user
    const old_password = req.body.old_password
    const new_password = req.body.new_password

    if (!old_password || !new_password) {
      throw boom.badRequest('old_password and new_password are requireds.')
    }

    let password_match = await bcrypt.compareSync(old_password, user.password)

    if (password_match) {
      user.password = req.body.new_password
      await user.save()
      sendJSONresponse(res, 200, {message: 'Contraseña actualizada.'})

    } else {
      sendJSONresponse(res, 402, {message: 'old_password don´t match'})
    }
  } catch(e) {
    return next(e)
  }
}

async function user_new_password (req, res, next) {
  try {
    let email = req.body.email

    if (!email) throw boom.badRequest('email is required')

    let user = await User.findOne({email: email})

    if (user) {
      let new_password = 'fvwefvwe'
      user.password = new_password
      await user.save()

      email_sender.new_password(user.email, user.full_name, new_password)
      sendJSONresponse(res, 200, {message: 'Se ha enviado una nueva contraseña a tu email.'})
    } else {
      sendJSONresponse(res, 200, {meesage: 'email not found'})
    }

  } catch (e) {
    return next(e)
  }
}

async function driver_delete (req, res, next) {
  try {
    let driver = await User.findByIdAndRemove(req.params.driver_id)

    sendJSONresponse(res, 200, driver)
  } catch(e) {
    return next(e)
  }
}


module.exports = {
  user_drivers_list,
  drivers_location,
  driver_location,
  driver_exit,
  driver_in,
  user_status,
  driver_details,
  user_add_review,
  driver_update_image,
  driver_update,
  driver_leave_base,
  user_change_password,
  user_new_password,
  driver_delete,
  driver_reviews
}
