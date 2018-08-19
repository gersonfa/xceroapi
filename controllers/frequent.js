const sendJSONresponse = require('../shared/common').sendJSONresponse
const Frequent = require('../models/frequent')
const boom = require('boom')

async function frequent_create(req, res, next) {
    try {
        const user = req.user
        const name = req.body.name
        const address = req.body.address
        const lat = req.body.lat
        const lng = req.body.lng

        let frequent = new Frequent({
            name,
            address,
            coords: [parseFloat(lng), parseFloat(lat)]
        })

        frequent.user = user._id
        frequent = await frequent.save()

        sendJSONresponse(res, 201, frequent)
    } catch(e) {
        return next(e)
    }
}

async function frequent_update(req, res, next) {
    try {
        const frequent_id = req.params.frequent_id
        const name = req.body.name
        const address = req.body.name
        const lat = req.body.lat
        const lng = req.body.lng

        let frequent = await Frequent.findByIdAndUpdate(frequent_id, {
            name,
            address,
            coords: [parseFloat(lng), parseFloat(lat)]
        }, true)

        sendJSONresponse(res, 200, frequent)
    } catch (e) {
        return next(e)
    }
}

async function frequent_delete (req, res, next) {
    try {
        const frequent_id = req.params.frequent_id

        let frequent = await Frequent.findByIdAndRemove(frequent_id)

        sendJSONresponse(res, 200, frequent)
    } catch(e) {
        return next(e)
    }
}

async function frequent_list(req, res, next) {
    try {
        const user = req.user

        let frequents = await Frequent.find({user: user._id})

        sendJSONresponse(res, 200, frequents)
    } catch(e) {
        return next(e)
    }
}

module.exports = {
    frequent_create,
    frequent_update,
    frequent_delete,
    frequent_list
}