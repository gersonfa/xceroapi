const Tariff = require('../models/tariff')
const Colony = require('../models/colony')
const Place = require('../models/place')
const User = require('../models/user')
const Group = require('../models/group')
const Base = require('../models/base')
const fetch = require('node-fetch')

function withinRadius(point, interest, kms) {
  let R = 6371;
  let deg2rad = (n) => { return Math.tan(n * (Math.PI/180)) };

  let dLat = deg2rad(interest.latitude - point.latitude );
  let dLon = deg2rad( interest.longitude - point.longitude );

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(point.latitude)) * Math.cos(deg2rad(interest.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let d = R * c;

  return (d <= kms);
}

async function set_tariff (service) {
    if (service.origin_colony) {
      if (service.destiny_colony) {
        let tariff = await Tariff.findOne({
          $or: [
            {origin_group: service.origin_colony.group, destiny_group: service.destiny_colony.group},
            {origin_group: service.destiny_colony.group, destiny_group: service.origin_colony.group}
          ]
        })
        service.tariff = tariff
        return service
      } else {
        let tariff = await Tariff.findOne({origin_group: service.origin_colony.group, destiny_place: service.destiny_place._id})
        service.tariff = tariff
        return service
      }
    } else if (service.origin_place) {
      if (service.destiny_colony) {
        let tariff = await Tariff.findOne({origin_place: service.origin_place._id, destiny_colony: service.destiny_colony._id})
        if (!tariff) {
          let colonies = await get_colonies(service.destiny_coords[1], service.destiny_coords[0])
          let colony = await Colony.findOne({place_id: {$in: colonies}})
          if (colony) {
            tariff = await Tariff.findOne({
              $or: [
                {origin_group: colony.group, destiny_group: service.destiny_colony.group},
                {origin_group: service.destiny_colony.group, destiny_group: colony.group}
              ]
            })
          }
        }
        
        service.tariff = tariff
        return service
      } else {
        let tariff = await Tariff.findOne({origin_group: service.origin_colony.group, destiny_place: service.destiny_place._id})
        if (!tariff) {
          let colonies = await get_colonies(service.destiny_coords[1], service.destiny_coords[0])
          let colony = await Colony.findOne({place_id: {$in: colonies}})
          if (colony) {
            tariff = await Tariff.findOne({
              $or: [
                {origin_group: colony.group, destiny_group: service.origin_colony.group},
                {origin_group: service.origin_colony.group, destiny_group: colony.group}
              ]
            })
          }
        }
        
        service.tariff = tariff
        return service
      }
    } else return service

}

async function get_colonies(lat, lng) {
  try {
    let place_ids = []
    while (place_ids.length == 0) {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAogodmHuA-P4Ais69knDP1HBlLOWCrCdg`)
      const json = await response.json()
      place_ids = json.results.map(p => p.place_id)
    }

    return place_ids
  } catch (e) {
    return e
  }
}

async function get_places(lat, lng) {
  try {
    const places = await Place.find({
      coords: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: 500
          }
        }
    })

    return places
  } catch(e) {
    return e
  }
}

async function get_close_drivers(service, distance) {
  const drivers = await User.find({
    coords: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: service.origin_coords
        },
        // Distancia en metros 3km por defecto
        $maxDistance: distance || 3000
      }
    },
    role: 'Driver',
    inService: false,
    enable: true
  })
  return drivers
}

async function get_base(service) {
  let base

  if (service.origin_colony) {
    const group = await Group.findById(service.origin_colony.group)
    base = await Base.findById(group.base)
  } else if (service.origin_place) {
    base = await Base.findById(service.origin_place.base)
  }
  return base
}

module.exports = {
  withinRadius,
  set_tariff,
  get_colonies,
  get_places,
  get_close_drivers,
  get_base
}
