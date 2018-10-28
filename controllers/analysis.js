const Analysis = require('../models/analysis')
const sendJSONresponse = require('../shared/common').sendJSONresponse

async function analysis_list(req, res, next) {
  try {
    const init_date = Number(req.query.init_date)
    const end_date = Number(req.query.end_date)

    console.log(init_date, end_date)
    let list = await Analysis.find()
      .populate('service')
      .populate({
        path: 'service',
        populate: {
          path: 'driver',
          select: 'full_name unit_number',
          model: 'User'
        }
      })

    list = list.filter(
      a =>
        a.service.request_time > init_date && a.service.request_time < end_date
    )

    sendJSONresponse(res, 200, list)
  } catch (e) {
    return next(e)
  }
}

async function analysis_info(req, res, next) {
  try {
    const analysis_id = req.params.id
    const analysis = await Analysis.findById(analysis_id)
      .populate('service')
      .populate({
        path: 'service',
        populate: { path: 'user', select: 'full_name email', model: 'User' }
      })
      .populate({
        path: 'service',
        populate: {
          path: 'driver',
          select: 'full_name unit_number',
          model: 'User'
        }
      })
      .populate('drivers.driver', 'full_name unit_number')

    sendJSONresponse(res, 200, analysis)
  } catch (e) {
    return next(e)
  }
}

module.exports = {
  analysis_list,
  analysis_info
}
