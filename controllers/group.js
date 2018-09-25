'use strict'

const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')
const Tariff = require('../models/tariff')
const Colony = require('../models/colony')
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

async function gp_list() {
	
		let groups = await Group.find().populate('base')

		let group_places = []

		groups.forEach(g => {
			if (!g.base) return

			let group = {
				_id: g._id,
				name: g.name,
				base: g.base.name,
				type: 'group'
			}

			group_places.push(group)
		})

		return group_places
	
}

async function group_place_list(req, res, next) {
	try {

		let group_places = await gp_list()

		sendJSONresponse(res, 200, group_places)
	} catch(e) {
		return next(e)
	}
}

async function group_place_available(req, res, next) {
	try {
		const group_id = req.query.group_id

		let groups_places = await gp_list()
		let tariffs = await Tariff.find()

		if (group_id) {
			let tariff_same_place = tariffs.find(t => (t.origin_group && t.origin_group.toString() == group_id) && (t.destiny_group && t.destiny_group.toString() == group_id))
			if (tariff_same_place) {
				groups_places = groups_places.filter( gp => gp._id.toString() != group_id)
			}

			groups_places = groups_places.filter(gp => {
				let tariff = tariffs.find(t => {
					if ((t.origin_group && t.origin_group.toString() == group_id) &&
					(
						(t.destiny_group && t.destiny_group.toString() == gp._id.toString()) ||
						(t.destiny_place && t.destiny_place.toString() == gp._id.toString())
					)
					) {
						return t
					} else if ((t.destiny_group && t.destiny_group.toString() == group_id) &&
					(
						(t.origin_group && t.origin_group.toString() == gp._id.toString()) ||
						(t.origin_place && t.origin_place.toString() == gp._id.toString())
					)
					) {
						return t
					}
				})
				if (!tariff) {
					return gp
				}
			})
		} 

		sendJSONresponse(res, 200, groups_places)
	} catch(e) {
		return next(e)
	}
}

async function group_delete (req, res, next) {
	try {
		const group_id = req.params.group_id

		let group = await Group.findByIdAndRemove(group_id)
		
		await Colony.deleteMany({group: group_id})
		await Tariff.deleteMany({$or: [{origin_group: group_id}, {destiny_group: group_id}]})

		sendJSONresponse(res, 200, group)
	} catch(e) {
		return next(e)
	}
}

module.exports = {
	group_create,
	group_list,
	group_by_base,
	group_place_available,
	group_place_list,
	group_delete
}
