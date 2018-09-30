'use strict'

const sendJSONresponse = require('../shared/common').sendJSONresponse
const Report = require('../models/report')

async function report_create(req, res, next) {
  try {
    const user = req.user

    let report = new Report(req.body)
    report.user = user._id
    report = await report.save()

    sendJSONresponse(res, 201, report)
  } catch (e) {
    return next(e)
  }
}

async function report_driver_list(req, res, next) {
  try {
    const driver_id = req.params.driver_id

    let reports = await Report.find({ driver: driver_id }).populate({
      path: 'user',
      select: 'full_name'
    })

    sendJSONresponse(res, 200, reports)
  } catch (e) {
    return next(e)
  }
}

async function report_list(req, res, next) {
  try {
    let reports = await Report.find()
      .populate({ path: 'user', select: 'full_name' })
      .populate({ path: 'driver', select: 'full_name' })

    sendJSONresponse(res, 200, reports)
  } catch (e) {
    return next(e)
  }
}
module.exports = {
  report_create,
  report_driver_list,
  report_list
}
