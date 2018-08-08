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
      if (user) {
        user.coords = coords
        await user.save()
      }

      if (!user.inService && user.enable) {
        const point = {
          type: 'Point',
          coordinates: coords
        }

        const geoOptions = {
          spherical: true,
          maxDistance: theEarth.getMetersFromKilometers(0.3)
        }

        let bases = await Base.geoNear(point, geoOptions)

        if (bases.length > 0) { // Se encuentra cerca de una base

          let base = bases[0].obj

          if (!(base.stack.map(u => u.toString()).includes(user.id))) { // Entra si el conductor no esta ya registrado en el stack
            base.stack.push(user._id)
            await base.save()

            io.to(socket_id).emit('added', { base: base.name, position: base.stack.indexOf(user.id) + 1 })
          }
        } else { // No esta en ninguna base hay que sacarlo de las bases que este registrado
          let bases = await Base.find({stack: user.id})

          if (bases.length > 0) {
              bases.map(async (base) => {
                base.stack = base.stack.filter(d => d != user.id)
                await base.save()
              })
            }
        }
      }
    })
  })
}
