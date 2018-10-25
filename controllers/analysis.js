const Analysis = require('../models/analysis')
const sendJSONresponse = require('../shared/common').sendJSONresponse

async function analysis_list(req, res, next) {
  try {
    const init_date = Number(req.query.init_date)
    const end_date = Number(req.query.end_date)

    const list = await Analysis.find({
      'service.request_time': { $gt: init_date, $lt: end_date }
    })
      .populate('service.driver service.user service.origin_group.base')
      .populate('drivers.driver')

    sendJSONresponse(res, 200, list)
  } catch (e) {
    return next(e)
  }
}

module.exports = {
  analysis_list
}
