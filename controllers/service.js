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

      if (user.inService) throw boom.badRequest('no puedes crear un servicio si estas activo en uno.')

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

      if (service.origin_colony || service.origin_place) {
        const assign_to_driver = await emit_new_service(service)

        if (assign_to_driver) {
          service = await service.save()
          user.inService = true
          await user.save()
          sendJSONresponse(res, 200, service)
        } else {
          sendJSONresponse(res, 402, {error: 'No hay conductores disponibles.'})
        }
      } else {
        sendJSONresponse(res, 402, {eror: 'No hay servicios disponibles desde la ubicación establecida.'})
      }


    } catch(e) {
      return next(e)
    }
  }

  async function service_list(req, res, next) {
    try {
      const user = req.user
      const state = req.query.state || 'completed'

      const services = await Service.find({$or: [{user: user._id, state: state}, {driver: user._id, state: state}]}).populate('origin_colony destiny_colony origin_place destiny_place')

      sendJSONresponse(res, 200, services)
    } catch(e) {
      return next(e)
    }
  }

  async function service_set_driver (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id).populate('origin_colony origin_place')

      service.driver = req.user._id
      service.state = 'on_the_way'

      let base = await service_utils.get_base(service)
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

      if (service_utils.withinRadius({longitude: service.origin_coords[0], latitude: service.origin_coords[1]}, {longitude: driver.coords[0], latitude: driver.coords[1]}, 0.2)) {
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

          const place_ids = await service_utils.get_colonies(origin_lat, origin_lng)

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

      user.inService = false
      await user.save()

      let client = await User.findById(service.user)
      client.inService = false
      await client.save()

      // Buscar tarifa
      service = await Colony.populate(service, 'origin_colony destiny_colony')
      service = await Place.populate(service, 'origin_place destiny_place')
      service = await service_utils.set_tariff(service)

      service = await service.save()

      let user_socket = users_online.get(service.user.toString())

      if (user_socket) {
        io.to(user_socket).emit('service_end', service)
      }

      sendJSONresponse(res, 200, service)

    } catch(e) {
      next(e)
    }
  }

  async function service_cancel (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id).populate('origin_colony')

      user.inService = false
      await user.save()

      if (user.role == 'Driver') {
        await emit_new_service(service)
        sendJSONresponse(res, 200, {message: 'Servicio asignado a otro conductor.'})

      } else {

        service.state = 'canceled'
        service = await service.save()

        if (service.driver) {
          let driver = await User.findById(service.driver)
          driver.inService = false
          await driver.save()

          let driver_socket = users_online.get(service.driver.toString())
          if (driver_socket) {
            io.to(driver_socket).emit('service_canceled', service)
          }
        }

        sendJSONresponse(res, 200, service)
      }


    } catch(e) {
      return next(e)
    }
  }

  async function service_reject (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id).populate('origin_colony origin_place')
      await emit_new_service(service, user._id)

      sendJSONresponse(res, 200, {message: 'Servicio rechazado correctamente'})
    } catch(e) {
      return next(e)
    }
  }

  async function service_negate (req, res, next) {
    try {
      let driver = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id)
      service.state = 'negated'
      service = await service.save()

      driver.inService = false
      await driver.save()

      let user = await User.findById(service.user)
      await user.save()

      let user_socket = users_online.get(service.user.toString())

      if (user_socket) {
        io.to(user_socket).emit('service_rejected', service)
      }

      sendJSONresponse(res, 200, service)
    } catch(e) {
      return next(e)
    }
  }

  async function emit_new_service (service, driver_reject) {

    if (service.status === 'Canceled') return false

    let base = await service_utils.get_base(service)

    if (base) {
      service = await User.populate(service, {path: 'user', select: 'full_name image'})
      // Servicio cancelado por conductor
      if (service.driver) {
        const result = await assign_to_close_driver(service, service.driver)
        return result
      //  Servicio rechazado en cola o en algun otro lugar
      } else if (driver_reject) {
        //  Verificar si el rechazo vino de base
        if (base.stack.map(d => d.toString).includes(driver_reject.toString)) {

          const reject_position = base.stack.indexOf(driver_reject) + 1

          if (base.stack.length != 0 && base.stack.length > reject_position) {

            const socket_driver = users_online.get(base.stack[reject_position + 1])

            if (socket_driver) {
              io.to(socket_driver).emit('new_service', service)
              return true
            }
          } else {
            await assign_to_close_driver(service)
          }
        } else {
          await assign_to_close_driver(service, driver_reject)
        }

      //  Servicio nuevo
      } else {
        if (base.stack.length > 0) {
          const socket_driver = users_online.get(base.stack[0].toString())

          if (socket_driver) {
            io.to(socket_driver).emit('new_service', service)
            return true
          }
        } else {
          const result = await assign_to_close_driver(service)
          return result
        }
      }
    } else {
      return false
    }
  }

  async function assign_to_close_driver (service, user_id) {
    let drivers = await service_utils.get_close_drivers(service)

    if (user_id) {
      drivers = drivers.filter(d => d._id.toString() != user_id.toString())
    }

    if (drivers.length > 0) {

      const driver_socket = users_online.get(drivers[0]._id.toString())

      if (driver_socket) {
        service = await User.populate(service, {path: 'user', select: 'full_name image'})
        io.to(driver_socket).emit('new_service', service)
        return true
      } else {
        return false
      }
    } else {
      // Avisar que no hay conductores
      const user_socket = users_online.get(service.user.toString())

      service.state = 'canceled'
      service = await service.save()

      let user = await User.findById(service.user)
      user.inService = false;
      await user.save()

      if (user_socket) {
        io.to(user_socket).emit('service_rejected', service)
      }
    }
  }

  async function service_by_driver (req, res, next) {
    try {
      const driver_id = req.params.driver_id

      let services = await Service.find({driver: driver_id})
      .populate('origin_colony origin_place destiny_colony destiny_place')
      .populate({path: 'user', select: 'full_name'})

      sendJSONresponse(res, 200, services)
    } catch (e) {
      return next(e)
    }
  }


  return {
    service_create,
    service_list,
    get_location,
    service_set_driver,
    service_start,
    service_end,
    service_cancel,
    service_reject,
    service_by_driver,
    service_negate
  }
}
