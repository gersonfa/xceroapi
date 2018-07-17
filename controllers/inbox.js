const sendJSONresponse = require('../shared/common').sendJSONresponse
const Inbox = require('../models/inbox')

async function inbox_create (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let inbox = new Inbox(req.body)
    inbox.driver = driver_id

    inbox = await inbox.save()

    sendJSONresponse(res, 201, inbox)
  } catch(e) {
    return next(e)
  }
}

async function inbox_list (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let inboxs = await Inbox.find({driver: driver_id})

    sendJSONresponse(res, 200, inboxs)
  } catch(e) {
    return next(e)
  }
}

module.exports = {
  inbox_create,
  inbox_list
}
