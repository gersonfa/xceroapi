'use strict'

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

    if (!origin_lat || !origin_lng) throw boom.badRequest('origin_lat origin_lng are requireds')

    let service = new Service({
      origin_coords: [parseFloat(origin_lng), parseFloat(origin_lat)],
      user: user._id
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

    service = await service.save()

    service = await Colony.populate(service, 'origin_colony destiny_colony')
    service = await Place.populate(service, 'origin_place destiny_place')

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

module.exports = {
  service_create,
  service_list
}
