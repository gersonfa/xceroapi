'use strict'
const User = require('../models/user')
const Base = require('../models/base')
const theEarth = require('../shared/common').theEarth

module.exports = (io, client) => {
  io.on('connect', async socket => {
    console.log(io.engine.clientsCount);
    const socket_id = socket.id
    let user_id = socket.handshake.query.user_id
    let times_disconnected = 0
    await client.hset('sockets', user_id, socket_id)

    //  console.log(user_id, socket_id)
    let user = await User.findById(user_id)
    if (!user) {
      return
    }
    if (user.role == 'Driver') {
      socket.join('drivers')
    }

    let check = setInterval(async () => {
      if (!socket.connected && user.role == 'Driver') {
        if (times_disconnected > 1) {
          console.log('se desconecto', user.full_name)
          //client.hdel('sockets', user_id)
          client.hdel('coords', user_id)
          socket.leave('drivers')
          clearInterval(check)
        } else {
          times_disconnected += 1
        }
      } else {
        times_disconnected = 0
      }
    }, 25000)

    socket.on('update_location', async socket => {
      const coords = socket.coords
      const user_id = socket.user_id

      client.hset('coords', user_id, JSON.stringify(coords))

      let user = await User.findById(user_id)

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

        if (bases.length > 0) {
          //  Se encuentra cerca de una base

          let base = bases[0].obj

          if (!base.stack.map(u => u.toString()).includes(user.id)) {
            //  Entra si el conductor no esta ya registrado en el stack
            base.stack.push(user._id)
            await base.save()

            io.to(socket_id).emit('added', {
              base: base.name,
              position: base.stack.indexOf(user.id) + 1
            })

            let bases_in = await Base.find({
              _id: { $ne: base._id },
              stack: user.id
            })

            if (bases_in.length > 0) {
              bases_in.map(async base => {
                base.stack = base.stack.filter(d => d != user.id)
                await base.save()
              })
            }
          }
        } else {
          let bases_in = await Base.find({ stack: user.id })

          if (bases_in.length > 0) {
            io.to(socket_id).emit('removed', { base: bases_in[0].name })
            bases_in.map(async base => {
              base.stack = base.stack.filter(d => d != user.id)
              await base.save()
            })
          }
        }
      }
    })

    socket.on('disconnect', async socket => {
      client.hdel('sockets', user_id)
      let bases = await Base.find({ stack: user_id })
      bases.map(async base => {
        base.stack = base.stack.filter(d => d != user_id)
        await base.save()
      })
    })
  })
}
