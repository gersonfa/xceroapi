'use strict'

const Service = require('../models/service')
const User = require('../models/user')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const boom = require('boom')
const service_utils = require('../shared/service-utils')
const Counter = require('../models/counter')
const Analysis = require('../models/analysis')

module.exports = (io, client) => {
  async function service_create(req, res, next) {
    try {
      const user = req.user

      if (user.inService)
        throw boom.badRequest(
          'no puedes crear un servicio si estas activo en uno.'
        )

      const origin_lat = req.body.origin_lat
      const origin_lng = req.body.origin_lng

      const details = req.body.details

      if (!origin_lat || !origin_lng || !details)
        throw boom.badRequest('origin_lat origin_lng details are requireds')

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

      let inside_area = await service_utils.inside_polygon(
        service.origin_coords.slice().reverse()
      )

      if (inside_area) {
        service.origin_group = inside_area.group

        if (service.destiny_coords) {
          let destiny_inside = await service_utils.inside_polygon(
            service.destiny_coords.slice().reverse()
          )

          if (destiny_inside) {
            service.destiny_group = destiny_inside.group
            // Asignar tarifa
          }
        }
      }

      if (service.origin_group) {
        let date = new Date()
        let date_fix = new Date(date.setHours(date.getHours() - 5))
        service.request_time = date_fix.getTime()
        service = await service.save()

        console.log(service)

        let today = new Date(date_fix.setHours(0, 0, 0, 0))
        await Counter.findOneAndUpdate(
          { date: today.getTime() },
          { $inc: { count: 1 } },
          { upsert: true }
        )

        let result = await emit_new_service(service)
        if (result) {
          sendJSONresponse(res, 200, service)

          setTimeout(async () => {
            let check_service = await Service.findById(service._id)
            if (
              !check_service.driver &&
              (check_service.state != 'canceled' &&
                check_service.state != 'negated')
            ) {
              check_service.state = 'negated'
              check_service = await check_service.save()

              let passenger = check_service.user.toString()
              let passenger_socket = await client.hget('sockets', passenger)
              io.to(passenger_socket).emit('service_rejected', check_service)
            }
          }, 30000)

        } else {
          sendJSONresponse(res, 402, { error: 'No hay conductores cercanos' })
        }
      } else {
        sendJSONresponse(res, 402, {
          eror: 'No hay servicios disponibles desde la ubicación establecida.'
        })
      }
    } catch (e) {
      return next(e)
    }
  }

  async function service_list(req, res, next) {
    try {
      const user = req.user
      const state = req.query.state || 'completed'

      const services = await Service.find({
        $or: [
          { user: user._id, state: state },
          { driver: user._id, state: state }
        ]
      })
        .populate('tariff')
        .populate({ path: 'user', select: 'full_name image' })
        .populate({ path: 'driver', select: 'full_name unit_number image' })

      sendJSONresponse(res, 200, services)
    } catch (e) {
      return next(e)
    }
  }

  async function service_set_driver(req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id
      const maximum = 1500
      const minimum = 1
      const randomnumber =
        Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

      let sleep = ms => new Promise(r => setTimeout(r, ms))
      await sleep(randomnumber)

      let service = await Service.findById(service_id)

      if (
        service.state === 'on_the_way' ||
        service.state === 'canceled' ||
        service.state === 'negated' ||
        service.state === 'in_process' ||
        service.state === 'completed'
      ) {
        throw boom.badRequest('El servicio ah sido cancelado o iniciado.')
      }

      service.driver = user._id
      service.state = 'on_the_way'

      service = await service.save()
      service = await User.populate(service, {
        path: 'driver',
        select: 'full_name image rating unit_number'
      })

      let passenger = service.user.toString()
      let passenger_socket = await client.hget('sockets', passenger)

      if (passenger_socket) {
        io.to(passenger_socket).emit('service_on_the_way', service)
      } else {
        setTimeout(async () => {
          passenger_socket = await client.hget('sockets', passenger)
          io.to(passenger_socket).emit('service_on_the_way', service)
        }, 3000)
      }

      sendJSONresponse(res, 200, service)

      let client_user = await User.findById(service.user)
      client_user.inService = true
      await client_user.save()

      user.inService = true
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

      let coords = await client.hget('coords', driver.id)
      coords = JSON.parse(coords)

      if (
        service_utils.withinRadius(
          {
            longitude: service.origin_coords[0],
            latitude: service.origin_coords[1]
          },
          { longitude: coords[0], latitude: coords[1] },
          0.3
        )
      ) {
        service.state = 'in_process'
        service.start_time = start_time
        await service.save()

        let passenger = service.user.toString()
        let passenger_socket = await client.hget('sockets', passenger)
        io.to(passenger_socket).emit('service_started', service)

        sendJSONresponse(res, 200, service)
      } else {
        sendJSONresponse(res, 402, {
          error:
            'No puedes empezar el servicio si no estás cerca de la ubicación de origen.'
        })
      }
    } catch (e) {
      return next(e)
    }
  }

  async function get_location(req, res, next) {
    try {
      const origin_lng = req.query.origin_lng
      const origin_lat = req.query.origin_lat

      let inside_area = await service_utils.inside_polygon([
        parseFloat(origin_lat),
        parseFloat(origin_lng)
      ])
      let group_id = inside_area ? inside_area.group : null

      sendJSONresponse(res, 200, { group: group_id })
    } catch (e) {
      return next(e)
    }
  }

  async function service_end(req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id
      const destiny_lat = req.body.destiny_lat
      const destiny_lng = req.body.destiny_lng
      const end_time = req.body.end_time
      const destiny_details = req.body.destiny_details

      if (!destiny_lat || !destiny_lng || !end_time)
        throw boom.badRequest(
          'destiny_lat, destiny_lng and end_time are requireds'
        )

      let service = await Service.findById(service_id)

      if (service.state === 'canceled' || service.state === 'negated') {
        throw boom.badRequest('service is canceled')
      }

      service.state = 'completed'
      service.destiny_coords = [
        parseFloat(destiny_lng),
        parseFloat(destiny_lat)
      ]
      service.end_time = end_time
      service.destiny_details = destiny_details

      let inside_area = await service_utils.inside_polygon(
        service.destiny_coords.slice().reverse()
      )

      if (inside_area) {
        service.destiny_group = inside_area.group
      }

      service = await service_utils.set_tariff(service)
      service = await service.save()

      let user_socket = await client.hget('sockets', service.user.toString())

      if (user_socket) {
        io.to(user_socket).emit('service_end', service)
      }

      sendJSONresponse(res, 200, service)
      io.to('drivers').emit('new_request', { _id: user.id })

      user.inService = false
      await user.save()

      let client_user = await User.findById(service.user)
      client_user.inService = false
      await client_user.save()
    } catch (e) {
      next(e)
    }
  }

  async function service_cancel(req, res, next) {
    try {
      const user = req.user
      const service_id = req.params.service_id

      let service = await Service.findById(service_id)
      if (service.state === 'completed' || service.state === 'negated') {
        throw boom.badRequest(
          'No se puede cancelar un servicio que ya fue completado o negado.'
        )
      }

      service.state = 'canceled'
      let date = new Date()
      let date_fix = new Date(date.setHours(date.getHours() - 5))
      service.canceled_time = date_fix.getTime()
      service = await service.save()

      sendJSONresponse(res, 200, service)

      user.inService = false
      await user.save()

      if (service.driver) {
        let driver = await User.findById(service.driver)
        driver.inService = false
        await driver.save()

        let driver_socket = await client.hget(
          'sockets',
          service.driver.toString()
        )
        if (driver_socket) {
          io.to(driver_socket).emit('service_canceled', service)
        }
      }
    } catch (e) {
      return next(e)
    }
  }

  //  Esta ruta se dejo de usar
  async function service_reject(req, res, next) {
    try {
      sendJSONresponse(res, 200, {
        message: 'Servicio rechazado correctamente'
      })
    } catch (e) {
      return next(e)
    }
  }

  async function service_negate(req, res, next) {
    try {
      let driver = req.user
      const service_id = req.params.service_id
      const reason_negated = req.body.reason_negated

      let service = await Service.findById(service_id)
      service.state = 'negated'
      service.reason_negated = reason_negated
      let date = new Date()
      let date_fix = new Date(date.setHours(date.getHours() - 5))
      service.negated_time = date_fix.getTime()
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
    } catch (e) {
      return next(e)
    }
  }

  async function emit_new_service(service) {
    let base = await service_utils.get_base(service)
    let count_online = 0

    service = await User.populate(service, {
      path: 'user',
      select: 'full_name'
    })

    console.log('emit', service)

    if (base) {
      await Promise.all(
        base.stack.map(async driver => {
          let driver_socket = await client.hget('sockets', driver.toString())
          if (driver_socket) {
            console.log('base', service)
            io.to(driver_socket).emit('new_service', service)
            count_online += 1
          }
        })
      )

      if (count_online === 0) {
        return await assign_to_close_driver(service)
      } else {
        let analysis = new Analysis({
          type: 'base',
          drivers: base.stack.map(d => {
            return { driver: d }
          }),
          service: service._id
        })

        await analysis.save()

        setTimeout(async () => {
          let check_service = await Service.findById(service._id)
          if (
            !check_service.driver &&
            (check_service.state != 'canceled' &&
              check_service.state != 'negated')
          ) {
            assign_to_close_driver(service)
          }
        }, 15000)
        
        return true
      }
    }
  }

  async function assign_to_close_driver(service) {
    let close_drivers = await service_utils.get_close_drivers(service)
    let total_drivers = 0

    await Promise.all(
      close_drivers.map(async driver => {
        const driver_socket = await client.hget('sockets', driver)
        if (driver_socket) {
          io.to(driver_socket).emit('new_service', service)
          total_drivers += 1
        }
      })
    )

    if (total_drivers === 0) {
      const user_socket = await client.hget('sockets', service.user.toString())

      service.state = 'negated'
      service = await service.save()

      let user = await User.findById(service.user)
      user.inService = false
      await user.save()

      if (user_socket) {
        io.to(user_socket).emit('service_rejected', service)
      }

      return false
    } else {
      return true
    }
  }

  async function service_by_driver(req, res, next) {
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
        .populate('tariff')
        .populate({ path: 'user', select: 'full_name' })

      sendJSONresponse(res, 200, services)
    } catch (e) {
      return next(e)
    }
  }

  function getMonday(d) {
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  async function emergency_enable(req, res, next) {
    try {
      let driver = req.user
      const service_id = req.query.service_id

      if (service_id) {
        let service = await Service.findById(service_id)
        driver = await User.findById(service.driver)
      }

      driver.emergency = true
      await driver.save()

      let near_drivers = await service_utils.get_close_drivers(
        { origin_coords: driver.coords },
        40000
      )
      near_drivers = await User.find({
        _id: { $in: near_drivers },
        enable: true,
        inService: false
      }).distinct('_id')
      near_drivers = near_drivers.map(d => d.toString())
      near_drivers = near_drivers.filter(d => d != driver.id)

      near_drivers.forEach(async d => {
        if (d == driver.id) return
        let d_socket = await client.hget('sockets', d)
        let coords = await client.hget('coords', driver.id)
        io.to(d_socket).emit('emergency', {
          _id: driver._id,
          unit_number: driver.unit_number,
          full_name: driver.full_name,
          coords: coords
        })
      })

      sendJSONresponse(res, 200, { emergency: driver.emergency })
    } catch (e) {
      return next(e)
    }
  }

  async function emergency_disable(req, res, next) {
    try {
      let driver = req.user
      const driver_id = req.query.driver_id

      if (driver_id) {
        driver = await User.findById(driver_id)
      }

      driver.emergency = false
      await driver.save()

      sendJSONresponse(res, 200, { emergency: driver.emergency })
    } catch (e) {
      return next(e)
    }
  }

  async function add_fee(req, res, next) {
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

  async function remove_fee(req, res, next) {
    try {
      let service_id = req.params.service_id
      let fee_id = req.params.fee_id

      let service = await Service.findById(service_id)
      let fee = service.fees.id(fee_id)
      service.fees.id(fee_id).remove()
      await service.save()

      sendJSONresponse(res, 200, fee)
    } catch (e) {
      return next(e)
    }
  }

  async function add_price(req, res, next) {
    try {
      let service_id = req.params.service_id

      let service = await Service.findById(service_id)
      service.price = req.body.price
      await service.save()

      sendJSONresponse(res, 200, { _id: service._id, price: req.body.price })
    } catch (e) {
      return next(e)
    }
  }

  async function get_area(req, res, next) {
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

  async function service_global(req, res, next) {
    try {
      const init_date = Number(req.query.init_date)
      const end_date = Number(req.query.end_date)
      const unit_numbers = JSON.parse(req.query.unit_numbers)
      const state = req.query.state || 'completed'
      let response = []
      let services = []

      if (state === 'completed') {
        services = await Service.find({
          state: state,
          driver: { $ne: null },
          end_time: { $gt: init_date, $lt: end_date }
        })
          .populate({ path: 'user', select: 'full_name' })
          .populate({ path: 'driver', select: 'unit_number' })
          .populate({ path: 'tariff', select: 'cost' })
      } else if (state === 'canceled') {
        services = await Service.find({
          state: state,
          driver: { $ne: null },
          canceled_time: { $gt: init_date, $lt: end_date }
        })
          .populate({ path: 'user', select: 'full_name' })
          .populate({ path: 'driver', select: 'unit_number' })
          .populate({ path: 'tariff', select: 'cost' })
      } else {
        services = await Service.find({
          state: state,
          driver: { $ne: null },
          negated_time: { $gt: init_date, $lt: end_date }
        })
          .populate({ path: 'user', select: 'full_name' })
          .populate({ path: 'driver', select: 'unit_number' })
          .populate({ path: 'tariff', select: 'cost' })
      }

      services = services.filter(s => s.driver && s.driver.unit_number)

      if (unit_numbers.length > 0) {
        unit_numbers.map(unit => {
          let r = {
            unit_number: unit,
            services: services.filter(s => s.driver.unit_number == unit)
          }
          response.push(r)
        })
      } else {
        services.map(s => {
          let index = response.findIndex(
            r => r.unit_number == s.driver.unit_number
          )
          if (index >= 0) {
            response[index].services.push(s)
          } else {
            response.push({ unit_number: s.driver.unit_number, services: [s] })
          }
        })
      }

      sendJSONresponse(res, 200, response)
    } catch (e) {
      return next(e)
    }
  }

  async function service_count(req, res, next) {
    try {
      const init_date = Number(req.query.init_date)
      const end_date = Number(req.query.end_date)

      let count = await Counter.find({
        date: { $gt: init_date, $lt: end_date }
      })

      sendJSONresponse(res, 200, count)
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
    get_area,
    service_global,
    service_count
  }
}
