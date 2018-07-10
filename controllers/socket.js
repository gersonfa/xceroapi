'use strict'
const User = require('../models/user')
const Base = require('../models/base')
const theEarth = require('../shared/common').theEarth

module.exports = (io, users_online) => {
  io.on('connect', (socket) => {
    const socket_id = socket.id
    let user_id = socket.handshake.query.user_id
    users_online.set(user_id, socket.id)
    console.log(users_online.entries())

    socket.on('update_location', async (socket) => {
      console.log(socket.user_id, socket.coords)
      //console.log(io.sockets.clients())

      const coords = socket.coords
      const user_id = socket.user_id

      let user = await User.findById(user_id)
      user.coords = coords
      await user.save()

      if (!user.inService) {
        const point = {
          type: 'Point',
          coordinates: coords
        }

        const geoOptions = {
          spherical: true,
          maxDistance: theEarth.getMetersFromKilometers(0.3)
        }

        let bases = await Base.geoNear(point, geoOptions)

        if (bases.length > 0) {
          let base = bases[0].obj
          let is_within = base.stack.indexOf(user_id)

          if (is_within === -1) {
            base.stack.push(user_id)
            await base.save()

            io.to(socket_id).emit('added', { base: base.name, position: base.stack.indexOf(user_id) + 1 })
          }
        }
      }
    })
  })
}
