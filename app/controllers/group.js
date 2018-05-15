'use strict'

const sendJSONresponse = require('../shared/common').sendJSONresponse
const Group = require('../models/group')
const Tariff = require('../models/tariff')
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

async function group_list_available(req, res, next) {
	try {
		const group_id = req.params.group_id

		let groups = await Group.find()
		let tariffs = await Tariff.find()

		groups = groups.filter(g => {
			let tariff = tariffs.find(t => {
				if ( t.groups.find(a => a == group_id) && t.groups.find(a => a == g.id) ) {
					return t
				}
			})

			if(!tariff) {
				return g
			}
		})

		sendJSONresponse(res, 200, groups)
	} catch(e) {
		return next(e)
	}
}

module.exports = {
	group_create,
	group_list,
	group_by_base,
	group_list_available
}