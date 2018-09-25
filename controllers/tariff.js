'use strict'

const Tariff = require('../models/tariff')
const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')
const Place = require('../models/place')
const Colony = require('../models/colony')
const boom = require('boom')
const service_utils = require('../shared/service-utils')

async function tariff_create(req, res, next) {
	try {
		let tariff = new Tariff(req.body)

		tariff = await tariff.save()

		tariff = await Group.populate(tariff, [
			{path: 'origin_group', populate: {path: 'base', select: 'name'}},
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}}
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
		const group_id = req.query.group_id

		let query = {}
		let tariffs = []

		if (base_id && (group_id || place_id)) {

			if (group_id) {
				query.$or = [
					{origin_group: group_id},
					{destiny_group: group_id}
				]
			} else if (place_id) {
				query.$or = [
					{origin_place: place_id}, 
					{destiny_place: place_id}
				]
			}

			tariffs = await Tariff
			.find(query)
			.populate([
				{path: 'origin_group', populate: {path: 'base', select: 'name'}},
				{path: 'destiny_group', populate: {path: 'base', select: 'name'}},
				{path: 'origin_place', populate: {path: 'base', select: 'name'}},
				{path: 'destiny_place', populate: {path: 'base', select: 'name'}}
			])

			sendJSONresponse(res, 200, { tariffs, pages: 1, current: 1})
		} else {
			tariffs = await Tariff
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
		}
		
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

		let origin_lat = req.query.origin_lat
		let origin_lng = req.query.origin_lng

		let destiny_lat = req.query.destiny_lat
		let destiny_lng = req.query.destiny_lng

		if (origin_lat && origin_lng && destiny_lat && destiny_lng) {
			let origin_coords = [parseFloat(origin_lat), parseFloat(origin_lng)]
			let destiny_coords = [parseFloat(destiny_lat), parseFloat(destiny_lng)]

			let origin = await service_utils.inside_polygon(origin_coords)
			let destiny = await service_utils.inside_polygon(destiny_coords)

			if (origin && destiny) {
				let tariff = await Tariff.findOne(
					{ $or: 
						[
							{origin_group: origin.group, destiny_group: destiny.group}, 
							{ origin_group: destiny.group, destiny_group: origin.group }
						]
					})
				sendJSONresponse(res, 200, tariff)
				
			} else {
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
			}
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
			{origin_group:group2_id, destiny_group: group1_id}
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
			{path: 'destiny_group', populate: {path: 'base', select: 'name'}}
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
