const sendJSONresponse = require('../shared/common').sendJSONresponse
const Area = require('../models/area')

async function area_create (req, res,next) {
    try {
        const group_id = req.params.group_id

        let area = new Area(req.body)
        area.group = group_id

        area = await area.save()

        sendJSONresponse(res, 201, area)
    } catch(e) {
        return next(e)
    }
}

async function area_delete(req, res, next) {
    try {
        const area_id = req.params.area_id

        let area = await Area.findByIdAndRemove(area_id)

        sendJSONresponse(res, 200, area)
    } catch (e) {
        return next(e)
    }
}

async function areas_by_group (req, res, next) {
    try {
        const group_id = req.params.group_id

        let areas = await Area.find({group: group_id})

        sendJSONresponse(res, 200, areas)
    } catch(e) {
        return next(e)
    }
}

async function areas_list (req, res, next) {
    try {
        let areas = await Area.find()

        sendJSONresponse(res, 200, areas)
    } catch (e) {
        return next(e)
    }
}

module.exports = {
    area_create,
    area_delete,
    areas_by_group,
    areas_list
}