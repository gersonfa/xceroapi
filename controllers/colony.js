'use strict'

const Colony = require('../models/colony')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const boom = require('boom')

async function colony_create(req, res, next) {
  try {
    const group_id = req.params.group_id
    const name = req.body.name
    const lat = req.body.lat
    const lng = req.body.lng
    const place_id = req.body.place_id

    if (!name || !lat || !lng)
      throw boom.badRequest('name, place_id, lng, lat is required')

    let colony = new Colony({
      name: name,
      coords: [parseFloat(lng), parseFloat(lat)],
      place_id: place_id,
      group: group_id
    })

    colony = await colony.save()

    sendJSONresponse(res, 201, colony)
  } catch (e) {
    return next(e)
  }
}

async function colony_by_group(req, res, next) {
  try {
    const group_id = req.params.group_id

    let colonies = await Colony.find({ group: group_id })

    sendJSONresponse(res, 200, colonies)
  } catch (e) {
    return next(e)
  }
}

async function colony_list(req, res, next) {
  try {
    let colonies = await Colony.find()

    sendJSONresponse(res, 200, colonies)
  } catch (e) {
    return next(e)
  }
}

async function colony_delete(req, res, next) {
  try {
    const colony_id = req.params.colony_id

    let colony = await Colony.findByIdAndRemove(colony_id)

    sendJSONresponse(res, 200, colony)
  } catch (e) {
    return next(e)
  }
}

module.exports = {
  colony_create,
  colony_by_group,
  colony_list,
  colony_delete
}
