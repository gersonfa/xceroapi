'use strict'

const Tariff = require('../models/tariff')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')

async function tariff_create(req, res, next) {
	try {
		let tariff = new Tariff(req.body)

		tariff = await tariff.save()

		tariff = await Group.populate(tariff, 'groups')

		sendJSONresponse(res, 200, tariff)
	} catch(e) {
		return next(e)
	}
}

async function tariff_list(req, res, next) {
	try {
		let tariffs = await Tariff.find().populate('groups')

		sendJSONresponse(res, 200, tariffs)
	} catch(e) {
		return next(e)
	}
}

module.exports = {
	tariff_create,
	tariff_list
}