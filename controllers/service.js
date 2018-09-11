'use strict'

const Service = require('../models/service')
const User = require('../models/user')
const Place = require('../models/place')
const Colony = require('../models/colony')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const boom = require('boom')
const service_utils = require('../shared/service-utils')

module.exports = (io, client) => {

  async function service_create (req, res, next) {
    try {
      const user = req.user

      if (user.inService) throw boom.badRequest('no puedes crear un servicio si estas activo en uno.')

      const origin_lat = req.body.origin_lat
      const origin_lng = req.body.origin_lng

      let origin_colony = req.body.origin_colony
      let origin_place = req.body.origin_place

      const details = req.body.details

      const destiny_colony = req.body.destiny_colony
      const destiny_place = req.body.destiny_place

      if (!origin_lat || !origin_lng || !details) throw boom.badRequest('origin_lat origin_lng details are requireds')

      const destiny_lat = req.body.destiny_lat
      const destiny_lng = req.body.destiny_lng

      let service = new Service({
        origin_coords: [parseFloat(origin_lng), parseFloat(origin_lat)],
        user: user._id,
        address: req.body.address,
        details: details,
        destiny_details: req.body.destiny_details
      })

      if (destiny_lat && destiny_lng) {
        let destiny_coords = [parseFloat(destiny_lng), parseFloat(destiny_lat)]
        service.destiny_coords = destiny_coords
      }

      let inside_area = await service_utils.inside_polygon(service.origin_coords.slice().reverse())

      if (inside_area) {
        service.origin_group = inside_area.group

        if (service.destiny_coords) {
          let destiny_inside = await service_utils.inside_polygon(service.destiny_coords.slice().reverse())

          if (destiny_inside) {
            service.destiny_group = destiny_inside.group
            // Asignar tarifa
          }
        }
      } else {
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
      }

      if (service.origin_colony || service.origin_place || service.origin_group) {

        service = await service.save()

        sendJSONresponse(res, 200, service)
        io.to('drivers').emit('new_request')

        service = await User.populate(service, {path: 'user', select: 'full_name'})
        await emit_new_service(service)
          
        setTimeout(async () => {
          let check_service = await Service.findById(service._id)
          if (!check_service.driver && (check_service.state != 'canceled' || check_service.state != 'negated')) {
            check_service.state = 'negated'
            check_service = await check_service.save()

            let passenger = check_service.user.toString()
            let passenger_socket = await client.hget('sockets', passenger)
            io.to(passenger_socket).emit('service_rejected', check_service)
          }
        }, 40000)

        setTimeout(async () => {
          let check_service = await Service.findById(service._id)
          if (!check_service.driver && (check_service.state != 'canceled' || check_service.state != 'negated')) {
            console.log('holi')
            await assign_to_close_driver(service)
          }
        }, 15000)

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

      const services = await Service.find({$or: [{user: user._id, state: state}, {driver: user._id, state: state}]})
      .populate('origin_colony destiny_colony origin_place destiny_place tariff')
      .populate({path: 'user', select: 'full_name image'})
      .populate({path: 'driver', select: 'full_name unit_number image'})

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

      if (service.state === 'canceled' || service.state === 'negated' || service.state === 'on_the_way') {
        throw boom.badRequest('El servicio ah sido cancelado o iniciado.')
      }

      if (service.driver) {
        throw boom.badRequest('El servicio ya ha sido asignado.')
      }

      service.driver = user._id
      service.state = 'on_the_way'

      service = await service.save()
      service = await User.populate(service, {path: 'driver', select: 'full_name image rating unit_number'})

      let passenger = service.user.toString()
      let passenger_socket = await client.hget('sockets', passenger)
      io.to(passenger_socket).emit('service_on_the_way', service)

      sendJSONresponse(res, 200, service)

      let client_user = await User.findById(service.user)
      client_user.inService = true
      await client_user.save()

      user.inService = true;
      await user.save()

      let base = await service_utils.get_base(service)
      base.stack = base.stack.filter(d => d != user.id)
      await base.save()

    } catch (e) {
      return next(e)
    }
  }

  async function service_start(req, res, next) {
    try {
      const driver = req.user
      const service_id = req.params.service_id
      const start_time = req.body.start_time
      
      if (!start_time) throw boom.badRequest('start_time is required')

      let service = await Service.findById(service_id)

      if (service.state === 'canceled' || service.state === 'negated') {
        throw boom.badRequest('service is canceled')
      }

      if (service_utils.withinRadius({longitude: service.origin_coords[0], latitude: service.origin_coords[1]}, {longitude: driver.coords[0], latitude: driver.coords[1]}, 0.2)) {
        service.state = 'in_process'
        service.start_time = start_time
        await service.save()

        let passenger = service.user.toString()
        let passenger_socket = await client.hget('sockets', passenger)
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

      let inside_area = await service_utils.inside_polygon([parseFloat(origin_lat), parseFloat(origin_lng)])
      let group_id = inside_area ? inside_area.group : null


      let place = await service_utils.get_places(origin_lat, origin_lng)

      if (place.length > 0) {
        let place_location = place[0]

        sendJSONresponse(res, 200, {place: place_location, group: group_id})
      } else {
        const place_ids = await service_utils.get_colonies(origin_lat, origin_lng)

        let colony = await Colony.findOne({place_id: { "$in": place_ids }})

        if (colony) {
           sendJSONresponse(res, 200, {colony: colony, group: group_id})
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
      const end_time = req.body.end_time
      const destiny_details = req.body.destiny_details

      if (!destiny_lat || !destiny_lng || !end_time) throw boom.badRequest('destiny_lat, destiny_lng and end_time are requireds')

      let service = await Service.findById(service_id)

      if (service.state === 'canceled' || service.state === 'negated') {
        throw boom.badRequest('service is canceled')
      }

      service.state = 'completed'
      service.destiny_coords = [parseFloat(destiny_lng), parseFloat(destiny_lat)]
      service.end_time = end_time
      service.destiny_details = destiny_details

      let inside_area = await service_utils.inside_polygon(service.destiny_coords.slice().reverse())

      if (inside_area) {
        service.destiny_group = inside_area.group
      } else {
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

        service = await Colony.populate(service, 'origin_colony destiny_colony')
        service = await Place.populate(service, 'origin_place destiny_place')
      }
      
      service = await service_utils.set_tariff(service)
      service = await service.save()

      let user_socket = await client.hget('sockets', service.user.toString())

      if (user_socket) {
        io.to(user_socket).emit('service_end', service)
      }

      sendJSONresponse(res, 200, service)

      user.inService = false
      await user.save()

      let client_user = await User.findById(service.user)
      client_user.inService = false
      await client_user.save()

    } catch(e) {
      next(e)
    }
  }

  async function service_cancel (req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id).populate('origin_colony')

      if (service.state == 'completed' || service.state == 'negated') throw boom.badRequest('No se puede cancelar un servicio que ya fue completado o negado.')

      user.inService = false
      await user.save()

      service.state = 'canceled'
      service = await service.save()

      sendJSONresponse(res, 200, service)

      if (service.driver) {
        let driver = await User.findById(service.driver)
        driver.inService = false
        await driver.save()

        let driver_socket = await client.hget('sockets', service.driver.toString())
        if (driver_socket) {
          io.to(driver_socket).emit('service_canceled', service)
        }
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

      if (service.state == 'canceled' || service.state == 'negated' || service.driver) {
        sendJSONresponse(res, 200, {message: 'Servicio rechazado correctamente'})
        return
      }

      //await emit_new_service(service, user._id)
      sendJSONresponse(res, 200, {message: 'Servicio rechazado correctamente'})
    } catch(e) {
      return next(e)
    }
  }

  async function service_negate (req, res, next) {
    try {
      let driver = req.user
      const service_id = req.params.service_id
      const reason_negated = req.body.reason_negated

      let service = await Service.findById(service_id)
      service.state = 'negated'
      service.reason_negated = reason_negated
      service = await service.save()

      let user_socket = await client.hget('sockets', service.user.toString())

      if (user_socket) {
        io.to(user_socket).emit('service_rejected', service)
      }

      sendJSONresponse(res, 200, service)

      driver.inService = false
      await driver.save()

      let user = await User.findById(service.user)
      user.inService = false
      await user.save()

    } catch(e) {
      return next(e)
    }
  }

  /* async function emit_new_service (service, driver_reject) {

    if (service.state === 'canceled' || service.state === 'negated' || service.driver) return false

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
          let drivers_in_base = base.stack.slice(reject_position)

          if (base.stack.length != 0 && drivers_in_base.length > 0) {

            const driver_online = drivers_in_base.find(async d => await client.get(d.toString()))
            
            if (driver_online) {
              console.log('vino de base', driver_online.full_name)
              let socket_driver = await client.hget('sockets', driver_online.toString())
              io.to(socket_driver).emit('new_service', service)
              return true
            }
          } else {
            await assign_to_close_driver(service, driver_reject)
          }
        } else {
          await assign_to_close_driver(service, driver_reject)
        }

      //  Servicio nuevo
      } else {
        if (base.stack.length > 0) {
          const driver_online = base.stack.find(async d => await client.hget('sockets', d.toString()))

          if (driver_online) {
            console.log('servicio nuevo', driver_online.full_name)
            let socket_driver = await client.hget('sockets', driver_online.toString())
            //console.log('driver_socket', socket_driver)
            io.to(socket_driver).emit('new_service', service)
            return true
          } else {
            const result = await assign_to_close_driver(service)
            return result
          }
        } else {
          const result = await assign_to_close_driver(service)
          return result
        }
      }
    } else {
      return false
    }
  } */

  async function emit_new_service(service) {
    let base = await service_utils.get_base(service)
    let count_online = 0

    if (base) {
      await Promise.all(base.stack.map(async driver => {
        let driver_socket = await client.hget('sockets', driver.toString())
        if (driver_socket) {
          console.log('servicio a base', driver, driver_socket)
          io.to(driver_socket).emit('new_service', service)
          console.log('count_online', count_online)
          count_online += 1
        }
      }))
      
      console.log('count', count_online === 0, count_online)
      if (count_online === 0) {
        await assign_to_close_driver(service)
      }
    }
  }

  /* async function assign_to_close_driver (service, user_id) {
    let drivers = await service_utils.get_close_drivers(service)

    if (user_id) {
      drivers = drivers.filter(d => d._id.toString() != user_id.toString())
    }

    if (drivers.length > 0) {

      const driver_online = drivers.find(async d => await client.hget('sockets', d.id))

      if (driver_online) {
        console.log('servicio a cercano', driver_online.full_name)
        const driver_socket = await client.hget('sockets', driver_online.id)
        service = await User.populate(service, {path: 'user', select: 'full_name image'})
        //console.log('driver_socket', driver_socket)
        io.to(driver_socket).emit('new_service', service)
        return true
      } else {
        return false
      }
    } else {
      // Avisar que no hay conductores
      const user_socket = await client.hget('sockets', service.user.toString())

      service.state = 'negated'
      service = await service.save()

      let user = await User.findById(service.user)
      user.inService = false;
      await user.save()

      if (user_socket) {
        io.to(user_socket).emit('service_rejected', service)
      }
    }
  } */

  async function assign_to_close_driver (service) {
    console.log('buscando cercanos')
    let close_drivers = await service_utils.get_close_drivers(service)
    let total_drivers = 0

    await Promise.all(close_drivers.map(async driver => {
      const driver_socket = await client.hget('sockets', driver.id)
      if (driver_socket) {
        console.log('Servicio a cercano', driver, driver_socket)
        io.to(driver_socket).emit('new_service', service)
        total_drivers += 1
      }
    }))

    if (total_drivers === 0) {
      console.log('no hubo conductores cercanos')
      const user_socket = await client.hget('sockets', service.user.toString())

      service.state = 'negated'
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
      const time = req.query.time
      let query = {
        driver: driver_id
      }

      if (time === 'day') {
        let date = new Date()
        let date_fix = new Date(date.setHours(date.getHours() - 5))
        let today = new Date(date_fix.setHours(0, 0, 0, 0))
        query.start_time = { $gt: today.getTime() }
      } else if (time === 'week') {
        let date = new Date()
        let date_fix = new Date(date.setHours(date.getHours() - 5))
        let today = new Date(date_fix.setHours(0, 0, 0, 0))
        let monday = getMonday(today)
        query.start_time = { $gt: monday.getTime() }
      }


      let services = await Service.find(query)
      .populate('origin_colony origin_place destiny_colony destiny_place tariff')
      .populate({path: 'user', select: 'full_name'})

      sendJSONresponse(res, 200, services)
    } catch (e) {
      return next(e)
    }
  }

  function getMonday(d) {
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }


  async function emergency_enable (req, res, next) {
    try {
      let driver = req.user
      const service_id = req.query.service_id
  
      if (service_id) {
        let service = await Service.findById(service_id)
        driver = await User.findById(service.driver)
      }
  
      driver.emergency = true
      await driver.save()
  
      let near_drivers = await service_utils.get_close_drivers({ origin_coords: driver.coords})
      near_drivers = near_drivers.filter(d => d._id != driver._id)

      near_drivers.forEach(async d => {
        if (d.id == driver.id) return
        let d_socket = await client.hget('sockets', d._id.toString())
        let coords = await client.hget('coords', driver.id)
        io.to(d_socket).emit('emergency', {
          _id: driver._id,
          unit_number: driver.unit_number,
          full_name: driver.full_name,
          coords: coords
        })
      })

      sendJSONresponse(res, 200, {emergency: driver.emergency})
  
    } catch(e) {
      return next(e)
    }
  }

  async function emergency_disable (req, res, next) {
    try {
      let driver = req.user
      const driver_id = req.query.driver_id

      if (driver_id) {
        driver = await User.findById(driver_id)
      }

      driver.emergency = false
      await driver.save()

      sendJSONresponse(res, 200, {emergency: driver.emergency})
    } catch(e) {
      return next(e)
    }
  }

  async function add_fee (req, res, next) {
    try {
      let service_id = req.params.service_id
      let fee = req.body

      let service = await Service.findById(service_id)
      if (service) {
        service.fees.push(fee)
        await service.save()

        sendJSONresponse(res, 200, service.fees)
      } else {
        throw boom.badRequest('service not found')
      }
    } catch (e) {
      return next(e)
    }
  }

  async function remove_fee (req, res, next) {
    try {
      let service_id = req.params.service_id
      let fee_id = req.params.fee_id

      let service = await Service.findById(service_id)
      let fee = service.fees.id(fee_id)
      service.fees.id(fee_id).remove()
      await service.save()

      sendJSONresponse(res, 200, fee)
    } catch(e) {
      return next(e)
    }
  }

  async function add_price (req, res, next) {
    try {
      let service_id = req.params.service_id

      let service = await Service.findById(service_id)
      service.price = req.body.price
      await service.save()

      sendJSONresponse(res, 200, {_id: service._id, price: req.body.price})
    } catch (e) {
      return next(e)
    }
  }

  async function get_area (req, res, next) {
    try {
      const lat = req.body.lat
      const lng = req.body.lng

      const point = [parseFloat(lat), parseFloat(lng)]

      let area = await service_utils.inside_polygon(point)

      sendJSONresponse(res, 200, area)
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
    service_negate,
    emergency_enable,
    emergency_disable,
    add_fee,
    remove_fee,
    add_price,
    get_area
  }
}
