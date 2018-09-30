const Tariff = require('../models/tariff')
const Group = require('../models/group')
const Base = require('../models/base')
const Area = require('../models/area')
const inside = require('point-in-polygon')
const geolib = require('geolib')
const redis = require('async-redis')
const client = redis.createClient()

function withinRadius(point, interest, kms) {
  let R = 6371
  let deg2rad = n => {
    return Math.tan(n * (Math.PI / 180))
  }

  let dLat = deg2rad(interest.latitude - point.latitude)
  let dLon = deg2rad(interest.longitude - point.longitude)

  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point.latitude)) *
      Math.cos(deg2rad(interest.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  let c = 2 * Math.asin(Math.sqrt(a))
  let d = R * c

  return d <= kms
}

async function inside_polygon(point) {
  let areas = await Area.find()
  let areas_map = areas.map(a => {
    return {
      _id: a._id,
      group: a.group,
      polygon: a.paths.map(p => [p.lat, p.lng])
    }
  })

  let area = areas_map.find(a => {
    return inside(point, a.polygon)
  })

  return area || null
}

async function set_tariff(service) {
  let origin_group = service.origin_group
  let destiny_group = service.destiny_group

  let tariff = await Tariff.findOne({
    $or: [
      { origin_group: origin_group, destiny_group: destiny_group },
      { origin_group: destiny_group, destiny_group: origin_group }
    ]
  })
  service.tariff = tariff
  return service
}

async function get_close_drivers(service, distance = 1400) {
  let drivers = await client.hkeys('coords')
  let close_drivers = []

  await Promise.all(
    drivers.map(async driver => {
      let coords = await client.hget('coords', driver)
      coords = JSON.parse(coords)
      let inside = await geolib.isPointInCircle(
        { latitude: coords[1], longitude: coords[0] },
        {
          latitude: service.origin_coords[1],
          longitude: service.origin_coords[0]
        },
        distance
      )
      if (inside) {
        close_drivers.push(driver)
      }
    })
  )

  return close_drivers
}

async function get_base(service) {
  let base
  if (service.origin_group) {
    const group = await Group.findById(service.origin_group)
    base = await Base.findById(group.base)
  }
  return base
}

module.exports = {
  withinRadius,
  set_tariff,
  get_close_drivers,
  get_base,
  inside_polygon
}
