'use strict'

const Tariff = require('../models/tariff')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')
const Place = require('../models/place')
const Colony = require('../models/colony')
const boom = require('boom')

async function tariff_create(req, res, next) {
	try {
		let tariff = new Tariff(req.body)

		tariff = await tariff.save()

		tariff = await Group.populate(tariff, 'origin_group destiny_group')
		tariff = await Place.populate(tariff, 'origin_place destiny_place')

		sendJSONresponse(res, 200, tariff)
	} catch(e) {
		return next(e)
	}
}

async function tariff_list(req, res, next) {
	try {
		//let tariffs = await Tariff.find().populate('origin_group destiny_group origin_place destiny_place')
		let tariffs = await Tariff.find().populate([
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}},
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		sendJSONresponse(res, 200, tariffs)
	} catch(e) {
		return next(e)
	}
}

async function tariff_check (req, res, next) {
	try {
		let colony_one = req.query.colony_one
		let colony_two = req.query.colony_two
		let place_one = req.query.place_one
		let place_two = req.query.place_two

		if (colony_one) {
			colony_one = await Colony.findById(colony_one)
			let group_one = await Group.findById(colony_one.group)

			if (colony_two) {
				colony_two = await Colony.findById(colony_two)
				let group_two = await Group.findById(colony_two.group)

				let tariff = await Tariff.findOne({ $or: [{origin_group: group_one._id, destiny_group: group_two._id}, { origin_group: group_two._id, destiny_group: group_one._id }]})
				sendJSONresponse(res, 200, tariff)
			} else if (place_one) {
				place_one = await Place.findById(place_one)

				let tariff = await Tariff.findOne({origin_group: group_one._id, destiny_place: place_one._id})
				sendJSONresponse(res, 200, tariff)
			}
		} else if (place_one) {
			// Buscar lugar
			place_one = await Place.findById(place_one)
			place_two = await Place.findById(place_two)

			let tariff = await Tariff.findOne({$or: [{origin_place: place_one._id, destiny_place: place_two._id}, {origin_place: place_two._id, destiny_place: place_one._id}]})
			sendJSONresponse(res, 200, tariff)
		} else {
			throw boom.badRequest('colony_one or place_one are requireds')
		}
	} catch(e) {
		return next(e)
	}
}

async function tariff_delete (req, res, next) {
	try {
		const tariff_id = req.params.tariff_id

		let tariff = await Tariff.findByIdAndRemove(tariff_id)

		sendJSONresponse(res, 200, tariff)
	} catch (e) {
		return next(e)
	}
}

module.exports = {
	tariff_create,
	tariff_list,
	tariff_check,
	tariff_delete
}
