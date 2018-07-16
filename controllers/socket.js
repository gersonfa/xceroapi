'use strict'
const User = require('../models/user')
const Base = require('../models/base')
const theEarth = require('../shared/common').theEarth
const mongoose = require('mongoose')

module.exports = (io, users_online) => {
  io.on('connect',  async (socket) => {
    const socket_id = socket.id
    let user_id = socket.handshake.query.user_id
    users_online.set(user_id, socket.id)
    
    let user = await User.findById(user_id)

    console.log(users_online.entries())

    socket.on('update_location', async (socket) => {
      console.log(socket.user_id, socket.coords)
      //console.log(io.sockets.clients())

      const coords = socket.coords
      const user_id = socket.user_id

      let user = await User.findById(user_id)
      console.log(user)
      if (user) {
        user.coords = coords
        await user.save()
      }

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

          if (!(base.stack.map(u => u.toString()).includes(user.id))) {
            base.stack.push(user._id)
            await base.save()

            io.to(socket_id).emit('added', { base: base.name, position: base.stack.indexOf(user.id) + 1 })
          }
        }
      }
    })
  })
}
