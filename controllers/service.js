'use strict'

const Service = require('../models/service')
const Base = require('../models/base')
const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Colony = require('../models/colony')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const theEarth = require('../shared/common').theEarth
const boom = require('boom')
const geocoder = require('geocoder-geojson')

module.exports = (io, users_online) => {
  const Service = require('../models/service')
  const Place = require('../models/place')
  const Colony = require('../models/colony')
  const sendJSONresponse = require('../shared/common').sendJSONresponse
  const theEarth = require('../shared/common').theEarth
  const boom = require('boom')
  const geocoder = require('geocoder-geojson')

  async function service_create (req, res, next) {
    try {
      const user = req.user

      const origin_lat = req.body.origin_lat
      const origin_lng = req.body.origin_lng

      let origin_colony = req.body.origin_colony
      let origin_place = req.body.origin_place

      const destiny_colony = req.body.destiny_colony
      const destiny_place = req.body.destiny_place

      if ((!origin_lat || !origin_lng) && (!origin_colony || !origin_place)) throw boom.badRequest('origin_lat origin_lng are requireds if you don´t send origin_colony or place_colony')

      let service = new Service({
        origin_coords: [parseFloat(origin_lng), parseFloat(origin_lat)],
        user: user._id,
        address: req.body.address
      })

      if (!origin_colony && !origin_place) {
        const point = {
          type: 'Point',
          coordinates: [parseFloat(origin_lng), parseFloat(origin_lat)]
        }

        const geoOptions = {
          spherical: true,
          maxDistance: theEarth.getMetersFromKilometers(0.5)
        }

        let place = await Place.geoNear(point, geoOptions)

        if (place.length > 0) {
          origin_place = place[0].obj

          service.origin_place = origin_place._id,
          service.destiny_place = destiny_place,
          service.destiny_colony = destiny_colony

        } else {
          // Buscar colonia
          const geojson = await geocoder.googleReverse([parseFloat(origin_lng), parseFloat(origin_lat)])

          if (geojson && geojson.features) {

            let place_ids = geojson.features.map(f => f.properties.place_id)
            let colony = await Colony.findOne({place_id: { "$in": place_ids }})
            if (colony) {
              service.origin_colony = colony._id
            }
          }
        }

      } else {

        service.origin_colony = origin_colony
        service.destiny_colony = destiny_colony
        service.origin_place = origin_place
        service.destiny_place = destiny_place
      }

      service = await Colony.populate(service, 'origin_colony destiny_colony')
      service = await Place.populate(service, 'origin_place destiny_place')

      if (service.origin_colony) {
        let group = await Group.findById(service.origin_colony.group)
        await emit_new_service(group.base, service)
        service.base = group.base
      } else if (service.origin_place) {
        await emit_new_service(service.origin_place.base, service)
        service.base = origin_place.base
      }

      service = await service.save()

      sendJSONresponse(res, 200, service)
    } catch(e) {
      return next(e)
    }
  }

  async function emit_new_service (base_id, service) {
    try {
      let base = await Base.findById(base_id)
      if (base && base.stack.length > 0) {
        let driver_id = base.stack[0].toString()
        let driver_socket = users_online.get(driver_id)
        if (driver_socket) {
          io.to(driver_socket).emit('new_service', service)
        }
      }
    } catch (e) {
      console.log(e)
      return e
    }
  }

  async function service_list(req, res, next) {
    try {
      const user = req.user
      const state = req.params.state || 'completed'

      const services = await Service.find({user: user._id, state: state}).populate('origin_colony destiny_colony origin_place destiny_place')

      sendJSONresponse(res, 200, services)
    } catch(e) {
      return next(e)
    }
  }

  async function service_set_driver (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id)

      service.driver = req.user._id
      service.state = 'on_the_way'

      let base = await Base.findById(service.base)
      base.stack = base.stack.filter(d => d != user.id)
      await base.save()

      await service.save()
      service = await User.populate(service, {path: 'driver', select: 'full_name image rating'})

      let passenger = service.user.toString()
      let passenger_socket = users_online.get(passenger)
      io.to(passenger_socket).emit('service_on_the_way', service)

      sendJSONresponse(res, 200, service)
    } catch (e) {
      return next(e)
    }
  }

  async function get_location(req, res, next) {
    try {
      const origin_lng = req.query.origin_lng
      const origin_lat = req.query.origin_lat

      const point = {
        type: 'Point',
        coordinates: [parseFloat(origin_lng), parseFloat(origin_lat)]
      }

      const geoOptions = {
        spherical: true,
        maxDistance: theEarth.getMetersFromKilometers(0.5)
      }

      let place = await Place.geoNear(point, geoOptions)

      if (place.length > 0) {
        let place_location = place[0].obj

        sendJSONresponse(res, 200, {place: place_location})
      } else {
        const geojson = await geocoder.googleReverse([parseFloat(origin_lng), parseFloat(origin_lat)])

        if (geojson && geojson.features) {

          let place_ids = geojson.features.map(f => f.properties.place_id)
          let colony = await Colony.findOne({place_id: { "$in": place_ids }})

          if (colony) {
            sendJSONresponse(res, 200, {colony: colony})
          } else {
            sendJSONresponse(res, 200, 'colony or place not found')
          }
        } else {
          sendJSONresponse(res, 200, 'colony or place not found')
        }
      }
    } catch(e) {
      return next(e)
    }
  }

  return {
    service_create,
    service_list,
    get_location,
    service_set_driver
  }
}
