const sendJSONresponse = require('./shared').sendJSONresponse
const Report = require('../models/report')

async function report_create (req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let report = new Report(req.body)
    report.driver = driver_id
    report = await report.save()

    sendJSONresponse(res, 201, report)
  } catch(e) {
    return next(e)
  }
}

module.exports = {
  report_create
}
