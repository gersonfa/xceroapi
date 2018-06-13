'use strict'
const User = require('../models/user')
const Base = require('../models/base')

module.exports = (io, users_online) => {
  io.on('connect', (socket) => {
    console.log('connection')

    let user_id = socket.handshake.query.user_id

    users_online.set(user_id, socket.id)

    console.log(users_online.entries())

    socket.on('update', (socket) => {
      console.log(socket.user_id)
      //console.log(io.sockets.clients())
    })
  })

  io.on('update', (socket) => {
    console.log(socket)
  })
}
