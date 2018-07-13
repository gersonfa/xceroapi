'use strict'

const Service = require('../models/service')
const Base = require('../models/base')
const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Colony = require('../models/colony')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const boom = require('boom')
const service_utils = require('../shared/service-utils')

module.exports = (io, users_online) => {

  async function service_create (req, res, next) {
    try {
      const user = req.user

      const origin_lat = req.body.origin_lat
      const origin_lng = req.body.origin_lng

      let origin_colony = req.body.origin_colony
      let origin_place = req.body.origin_place

      const destiny_colony = req.body.destiny_colony
      const destiny_place = req.body.destiny_place

      if (!origin_lat || !origin_lng) throw boom.badRequest('origin_lat origin_lng are requireds')

      let service = new Service({
        origin_coords: [parseFloat(origin_lng), parseFloat(origin_lat)],
        user: user._id,
        address: req.body.address
      })

      if (!origin_colony && !origin_place) {

        let place = await service_utils.get_places(origin_lat, origin_lng)

        if (place.length > 0) {
          origin_place = place[0]

          service.origin_place = origin_place._id

        } else {
          // Buscar colonia

            const place_ids = await service_utils.get_colonies(origin_lat, origin_lng)

            let colony = await Colony.findOne({place_id: { "$in": place_ids }})
            if (colony) {
              service.origin_colony = colony._id
            }
        }

      } else {

        service.origin_colony = origin_colony
        service.origin_place = origin_place
      }

      service.destiny_colony = destiny_colony
      service.destiny_place = destiny_place

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

      let driver = await User.findById(user._id)
      driver.inService = true;
      await driver.save()

      let passenger = service.user.toString()
      let passenger_socket = users_online.get(passenger)
      io.to(passenger_socket).emit('service_on_the_way', service)

      sendJSONresponse(res, 200, service)
    } catch (e) {
      return next(e)
    }
  }

  async function service_start(req, res, next) {
    try {
      const driver = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id)

      if (service_utils.withinRadius(service.origin_coords, driver.coords, 0.2)) {
        service.state = 'in_process'
        await service.save()

        let passenger = service.user.toString()
        let passenger_socket = users_online.get(passenger)
        io.to(passenger_socket).emit('service_started', service)

        sendJSONresponse(res, 200, service)

      } else {
        sendJSONresponse(res, 402, { error: 'No puedes empezar el servicio si no estás cerca de la ubicación de origen.'})
      }


    } catch(e) {
      return next(e)
    }
  }

  async function get_location(req, res, next) {
    try {
      const origin_lng = req.query.origin_lng
      const origin_lat = req.query.origin_lat

      let place = await service_utils.get_places(origin_lat, origin_lng)

      if (place.length > 0) {
        let place_location = place[0]

        sendJSONresponse(res, 200, {place: place_location})
      } else {

          const place_ids = await service_utils.get_colonies(destiny_lat, destiny_lng)

          let colony = await Colony.findOne({place_id: { "$in": place_ids }})

          if (colony) {
            sendJSONresponse(res, 200, {colony: colony})
          } else {
            sendJSONresponse(res, 200, 'colony or place not found')
          }
      }
    } catch(e) {
      return next(e)
    }
  }

  async function service_end (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id
      const destiny_lat = req.body.destiny_lat
      const destiny_lng = req.body.destiny_lng

      if (!destiny_lat || !destiny_lng) throw boom.badRequest('destiny_lat & destiny_lng are requireds')

      let service = await Service.findById(service_id)
      service.state = 'completed'
      service.destiny_coords = [parseFloat(destiny_lng), parseFloat(destiny_lat)]

      let place = await service_utils.get_places(destiny_lat, destiny_lng)

      if (place.length > 0) {
        let place_location = place[0]

        service.destiny_place = place_location._id
      } else {
          const place_ids = await service_utils.get_colonies(destiny_lat, destiny_lng)
          let colony = await Colony.findOne({place_id: { "$in": place_ids }})
          if (colony) {
            service.destiny_colony = colony._id
          } else {
            // No se encontro ni place ni colony
          }
      }

      let driver = await User.findById(user._id)
      driver.inService = false
      await driver.save()

      // Buscar tarifa
      service = await Colony.populate(service, 'origin_colony destiny_colony')
      service = await Place.populate(service, 'origin_place destiny_place')
      service = await service_utils.set_tariff(service)
      service = await service.save()
      sendJSONresponse(res, 200, service)


    } catch(e) {
      next(e)
    }
  }

  async function service_cancel (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id)

      if (user.role == 'Driver') {
        let drivers = await service_utils.get_close_drivers(service)
        drivers = drivers.filter(d => d._id.toString() != user.id)
        if (drivers.length > 0) {
          let driver_socket = users_online.get(drivers[0]._id)
          service.state = 'Pending'
          await service.save()
          service = await User.populate(service, {path: 'user', select: 'full_name image'})
          if (driver_socket) {
            io.to(driver_socket).emit('new_service', service)
          }
          sendJSONresponse(res, 200, service)
        } else {
          sendJSONresponse(res, 200, {error: 'no es posible cancelar el servicio'})
        }
      } else {
        service.state = 'canceled'
        service = await service.save()

        let driver_socket = users_online.get(service.driver)
        if (driver_socket) {
          io.to(driver_socket).emit('service_canceled', service)
        }
        sendJSONresponse(res, 200, service)
      }

      
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
        service = await User.populate(service, {path: 'user', select: 'full_name image'})
        if (driver_socket) {
          io.to(driver_socket).emit('new_service', service)
        }
      }
    } catch (e) {
      return e
    }
  }

  return {
    service_create,
    service_list,
    get_location,
    service_set_driver,
    service_start,
    service_end,
    service_cancel
  }
}
