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

    let check = setInterval(async () => {
      if (!socket.connected) {
        console.log('se desconecto', user)
        users_online.delete(user_id)
        let bases = await Base.find({stack: user_id})

        bases.map(async (base) => {
          base.stack = base.stack.filter(d => d != user.id)
          await base.save()
        })
        clearInterval(check)
      }
    }, 10000)

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
          maxDistance: theEarth.getMetersFromKilometers(0.05)
        }

        let bases = await Base.geoNear(point, geoOptions)

        if (bases.length > 0) { // Se encuentra cerca de una base

          let base = bases[0].obj

          if (!(base.stack.map(u => u.toString()).includes(user.id))) { // Entra si el conductor no esta ya registrado en el stack
            base.stack.push(user._id)
            await base.save()

            io.to(socket_id).emit('added', { base: base.name, position: base.stack.indexOf(user.id) + 1 })

            let bases_in = await Base.find({_id: {$ne: base._id}, stack: user.id})

            console.log(bases_in)

            if (bases_in.length > 0) {
              bases_in.map(async (base) => {
                base.stack = base.stack.filter(d => d != user.id)
                await base.save()
              })
            }
          }
        } else {
          let bases_in = await Base.find({stack: user.id})

          if (bases_in.length > 0) {
            io.to(socket_id).emit('removed', { base: bases_in[0].name })
            bases_in.map(async (base) => {
              base.stack = base.stack.filter(d => d != user.id)
              await base.save()
            })
          }
        }
      }
    })

    socket.on('disconnect', async (socket) => {
      const user_id = socket.user_id
      users_online.delete(user_id)
      let bases = await Base.find({stack: user_id})

      bases.map(async (base) => {
        base.stack = base.stack.filter(d => d != user.id)
        await base.save()
      })

      /* let user = await User.findById(user_id)
      user.inService = true
      await user.save() */

    })
  })
}
