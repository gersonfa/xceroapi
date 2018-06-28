'use strict'

const Place = require('../models/place')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Boom = require('boom')

async function place_list(req, res, next) {
  try {
    const places = await Place.find()

    sendJSONresponse(res, 200, places)
  } catch(e) {
    return next(e)
  }
}

async function place_by_base (req, res, next) {
  try {
    const base_id = req.params.base_id

    const places = await Place.find({base: base_id})

    sendJSONresponse(res, 200, places)
  } catch(e) {
    return next(e)
  }
}

async function place_create(req, res, next) {
  try {
    const base_id = req.params.base_id
    const name = req.body.name
		const address = req.body.address
		const lat = req.body.lat
		const lng = req.body.lng
    const place_id = req.body.place_id

    if (!base_id || !address || !name) throw Boom.badRequest('base_id address name are required')

    let place = new Place({
      base: base_id,
      name: name,
			address: address,
			coords: [parseFloat(lng), parseFloat(lat)],
      place_id: place_id
    })

    place = await place.save()

    sendJSONresponse(res, 201, place)
  } catch(e) {
    return next(e)
  }
}

module.exports = {
  place_list,
  place_by_base,
  place_create
}
