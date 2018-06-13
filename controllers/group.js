'use strict'

const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')
const Tariff = require('../models/tariff')
const Place = require('../models/place')
const mongoose = require('mongoose')

async function group_create(req, res, next) {
	try {
		const base_id = req.params.base_id

		let group = new Group(req.body)
		group.base = base_id

		group = await group.save()

		sendJSONresponse(res, 201, group)
	} catch(e) {
		return next(e)
	}
}

async function group_list(req, res, next) {
	try {
		let groups = await Group.find()

		sendJSONresponse(res, 200, groups)
	} catch(e) {
		return next(e)
	}
}

async function group_by_base(req, res, next) {
	try {
		const base_id = req.params.base_id

		let groups = await Group.find({base: base_id})

		sendJSONresponse(res, 200, groups)
	} catch(e) {
		return next(e)
	}
}

async function group_place_list(req, res, next) {
	try {
		let groups = await Group.find()
		let places = await Place.find()

		let group_places = []

		groups.forEach(g => {
			let group = {
				_id: g._id,
				name: g.name,
				type: 'group'
			}

			group_places.push(group)
		})

		places.forEach(p => {
			let place = {
				_id: p._id,
				name: p.name,
				type: 'place'
			}

			group_places.push(place)
		})

		sendJSONresponse(res, 200, group_places)
	} catch(e) {
		return next(e)
	}
}

async function group_place_available(req, res, next) {
	try {
		const group_id = req.query.group_id
		const place_id = req.query.place_id

		let groups = await Group.find()
		let places = await Place.find()
		let tariffs = await Tariff.find()

		groups = groups.filter(g => {
			let tariff = tariffs.find(t => (t.origin_group == group_id && t.destiny_group == g._id) || (t.origin_group == g._id && t.destiny_group == group_id))

			if (!tariff) {
				return g
			}
		})

		/*places = places.filter(p => {
			let tariff = tariffs.find(t => t.origin_place == p._id && )
		})*/

		sendJSONresponse(res, 200, groups)
	} catch(e) {
		return next(e)
	}
}

module.exports = {
	group_create,
	group_list,
	group_by_base,
	group_place_available,
	group_place_list
}
