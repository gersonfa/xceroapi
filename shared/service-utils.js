const Tariff = require('../models/tariff')
const Place = require('../models/place')
const User = require('../models/user')
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
  try {
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
        let tariff = await Tariff.findOne({origin_place: service.origin_place._id, destiny_place: service.destiny_place._id})
        service.tariff = tariff
        return service
      }
    } else return service
  } catch(e) {
    return e
  }
}

async function get_colonies(lat, lng) {
  try {
    let place_ids = []
    while (place_ids.length == 0) {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`)
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

async function get_close_drivers(service) {
  const drivers = await User.find({
    coords: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: service.origin_coords
        },
        $maxDistance: 40000
      }
    },
    role: 'Driver',
    inService: false
  })

  return drivers
}

module.exports = {
  withinRadius,
  set_tariff,
  get_colonies,
  get_places,
  get_close_drivers
}
