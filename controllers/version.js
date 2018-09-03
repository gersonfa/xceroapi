const Version = require('../models/version')
const sendJSONresponse = require('../shared/common').sendJSONresponse

async function version_create (req, res, next) {
    try {
        let version = new Version(req.body)
        version = await version.save()

        sendJSONresponse(res, 200, version)

    } catch(e) {
        return next(e)
    }
}

async function version_android (req, res, next) {
    try {
        let version = await Version.findOne({platform: 'Android'})

        sendJSONresponse(res, 200, version)
    } catch (e) {
        return next(e)
    }
}

async function version_ios (req, res, next) {
    try {
        let version = await Version.findOne({platform: 'iOS'})

        sendJSONresponse(res, 200, version)
    } catch (e) {
        return next(e)
    }
}

async function version_update (req, res, next) {
    try {
        let platform = req.body.platform

        let version = await Version.findOneAndUpdate({platform: platform}, {version: req.body.version})

        sendJSONresponse(res, 200, version)
    } catch (e) {
        return next(e)
    }
}

module.exports = {
    version_create,
    version_android,
    version_ios,
    version_update
}