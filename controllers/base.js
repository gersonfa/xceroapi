'use strict'
const sendJSONresponse = require('../shared/common').sendJSONresponse

const Base = require('../models/base')
const boom = require('boom')

async function base_create(req, res, next) {
	try {
		const name = req.body.name
		const address = req.body.address
		const lat = req.body.lat
		const lng = req.body.lng

		if (!name || !address || !lat || !lng) throw boom.badRequest('name, address, lng, lat is required')

		let base = new Base({
			name: name,
			address: address,
			coords: [parseFloat(lng), parseFloat(lat)]
		})

		base = await base.save()

		sendJSONresponse(res, 201, base)
	} catch(e) {
		return next(e)
	}
}

async function base_list(req, res, next) {
	try {
		let bases = await Base.find()

		sendJSONresponse(res, 200, bases)
	} catch(e) {
		return next(e)
	}
}

async function base_delete(req, res, next) {
	try {
		const base_id = req.params.base_id

		let base = await Base.findByIdAndRemove(base_id)

		sendJSONresponse(res, 200, base)
	} catch(e) {
		return next(e)
	}
}

async function base_details(req, res, next) {
	try {
		const base_id = req.params.base_id

		let base = await Base.findById(base_id)

		sendJSONresponse(res, 200, base)
	} catch (e) {
		return next(e)
	}
}

async function base_empty_stack (req, res, next) {
	try {
		const base_id = req.params.base_id

		let base = await Base.findById(base_id)

		base.stack = []
		base = await base.save()

		sendJSONresponse(res, 200, base)
	} catch (e) {
		return next(e)
	}
}

module.exports = {
	base_create,
	base_list,
	base_delete,
	base_details,
	base_empty_stack
}
