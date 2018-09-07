const sendJSONresponse = require('../shared/common').sendJSONresponse
const Inbox = require('../models/inbox')
const Notice = require('../models/notice')
const User = require('../models/user')
const redis = require('async-redis')
const client = redis.createClient()

module.exports = (io, client) => {

  async function inbox_create (req, res, next) {
    try {
      const driver_id = req.params.driver_id

      let inbox = new Inbox(req.body)
      inbox.driver = driver_id

      inbox = await inbox.save()

      const driver_socket = await client.hget('sockets', driver_id)
      if (driver_socket) {
        io.to(driver_socket).emit('inbox', inbox)
      }

      sendJSONresponse(res, 201, inbox)
    } catch(e) {
      return next(e)
    }
  }

  async function inbox_list (req, res, next) {
    try {
      const driver_id = req.params.driver_id

      let inboxs = await Inbox.find({driver: driver_id}).sort({date: -1})

      sendJSONresponse(res, 200, inboxs)
    } catch(e) {
      return next(e)
    }
  }

  async function notice_create (req, res, next) {
    try {
      let notice = new Notice(req.body)
      await notice.save()

      let drivers = await User.find({role: 'Driver'})
      drivers.map(async d => {
        let exist = await client.hexists('sockets', d.id)
        if (exist) {
          let socket_driver = await client.hget('sockets', d.id)
          io.to(socket_driver).emit('notice', notice)
        }
      })

      sendJSONresponse(res, 200, notice)
    } catch(e) {
      return next(e)
    }
  }

  async function notice_list (req, res, next) {
    try {
      let notices = await Notice.find().sort({date: -1})

      sendJSONresponse(res, 200, notices)
    } catch(e) {
      return next(e)
    }
  }

  async function notice_delete (req, res, next) {
    try {
      let notice_id = req.params.notice_id

      let notice = await Notice.findByIdAndRemove(notice_id)

      sendJSONresponse(res, 200, notice)
    } catch(e) {
      return next(e)
    }
  }

  return {
    inbox_create,
    inbox_list,
    notice_delete,
    notice_list,
    notice_create
  }

}