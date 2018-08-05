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

		tariff = await Group.populate(tariff, [
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}}
		])
		tariff = await Place.populate(tariff, [
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		sendJSONresponse(res, 200, tariff)
	} catch(e) {
		return next(e)
	}
}

async function tariff_list(req, res, next) {
	try {
		const perPage = 15
		var page = req.query.page || 1
		const base_id = req.query.base_id

		let query = {}

		if (base_id) {
			let groups_ids = await Group.find({base: base_id}).distinct('_id')
			let places_ids = await Place.find({base: base_id}).distinct('_id')

			query.$or = [
				{origin_place: {$in: places_ids}}, 
				{destiny_place: {$in: places_ids}},
				{origin_group: {$in: groups_ids}},
				{destiny_group: {$in: groups_ids}}
			]
		}
		
		let tariffs = await Tariff
		.find(query)
		.skip((perPage * page) - perPage)
        .limit(perPage)
		.populate([
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}},
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		let count = await Tariff.count(query)

		sendJSONresponse(res, 200, {
			tariffs,
			pages: Math.ceil(count / perPage),
			current: page,
			count
		})
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

async function tariff_update (req, res, next) {
	try {
		const tariff_id = req.params.tariff_id

		let tariff = await Tariff.findByIdAndUpdate(tariff_id, req.body, { new: true })

		tariff = await Group.populate(tariff, [
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}}
		])
		tariff = await Place.populate(tariff, [
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		sendJSONresponse(res, 200, tariff)
	} catch (e) {
		return next(e)
	}
}

async function tariff_update_all (req, res, next) {
	try {
		const percentage = req.body.percentage
		const quantity = req.body.quantity

		let tariffs = await Tariff.find()

		if (quantity) {
			await Promise.all(tariffs.map(async (t) => {
				t.cost += quantity
				t = await t.save()
			}))
		} else if (percentage) {
			await Promise.all(tariffs.map(async (t) => {
				let quantity_calculated = Math.round((t.cost * percentage) / 100)
				t.cost += quantity_calculated
				t = await t.save()
			}))
		}

		tariffs = await Tariff.find().populate([
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}},
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		sendJSONresponse(res, 200, tariffs)
	} catch (e) {
		return next(e)
	}
}

async function tariff_by_groups (req, res, next) {
	try {
		const group1_id = req.params.group1_id
		const group2_id = req.params.group2_id

		let tariff = await Tariff.findOne({$or: [
			{origin_group: group1_id, destiny_group: group2_id},
			{origin_group:group2_id, destiny_group: group1_id},
			{origin_group: group1_id, destiny_place: group2_id},
			{origin_group: group2_id, destiny_place: group1_id},
			{origin_place: group1_id, destiny_place: group2_id},
			{origin_place: group2_id, destiny_place: group1_id}
		]})

		sendJSONresponse(res, 200, tariff)
	} catch (e) {
		return next(e)
	}
}

async function tariff_details (req, res, next) {
	try {
		const tariff_id = req.params.tariff_id

		let tariff = await Tariff.findById(tariff_id)
		.populate([
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}},
			{path: 'origin_place', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
		])

		sendJSONresponse(res, 200, tariff)
	} catch (e) {
		return next(e)
	}
}

module.exports = {
	tariff_create,
	tariff_list,
	tariff_check,
	tariff_delete,
	tariff_update,
	tariff_update_all,
	tariff_by_groups,
	tariff_details
}
