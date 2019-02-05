// Kosmos Updater Server
// Copyright (C) 2019 Steven Mattera
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

const fs = require('fs')
const App = require('../models/app.model')
const Bundle = require('../models/bundle.model')
const Package = require('../models/package.model')
const Payload = require('../models/payload.model')

module.exports = class V4Controller {
    constructor() {
        this.serverHeader = 'SDFU/4.0'
    }

    getApp(req, res) {
        App.findOne({ channel: 'stable' }).sort({ _id: -1 }).exec((err, app) => {
            if (err || app === null) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            const stat = fs.statSync(app.path)

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Content-Length', stat.size)
            res.setHeader('Content-Disposition', 'attachment; filename="KosmosUpdater.nro"')
            fs.createReadStream(app.path).pipe(res)
        })
    }

    getAppVersionNumber(req, res) {
        App.findOne({ channel: 'stable' }).sort({ _id: -1 }).exec((err, app) => {
            if (err || app === null) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', 'text/plain')
            res.setHeader('Content-Length', app.version.length)
            res.send(app.version)
        })
    }

    getBundles(req, res) {
        Bundle.find({}).sort({ order: -1 }).exec((err, bundles) => {
            if (err || bundles === null) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            let result = bundles.map((bundle) => bundle.name).join(',')

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', 'text/plain')
            res.setHeader('Content-Length', result.length)
            res.send(result);
        })
    }

    getPackage(req, res) {
        Package.findOne({ bundle: req.query.bundle, channel: req.query.channel }).sort({ _id: -1 }).exec((err, package) => {
            if (err) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            if (package === null) {
                res.status(404)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            if (req.influxdb) {
                req.influxdb.writeMeasurement('download', [{
                    tags: { bundle: package.bundle, channel: package.channel },
                    fields: { count: 1 },
                    timestamp: new Date()
                }])
            }

            const stat = fs.statSync(package.path + '.zip')

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', `application/zip`)
            res.setHeader('Content-Length', stat.size)
            res.setHeader('Content-Disposition', `attachment; filename="${ package.bundle }-${ package.channel }.zip"`)
            res.setHeader('X-Version-Number', package.version)
            res.setHeader('X-Number-Of-Files', package.numberOfFiles)

            fs.createReadStream(package.path + '.zip').pipe(res)
        })
    }

    getPackageVersionNumber(req, res) {
        Package.findOne({ channel: req.query.channel }).sort({ _id: -1 }).exec((err, package) => {
            if (err) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            if (package === null) {
                res.status(404)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', 'text/plain')
            res.setHeader('Content-Length', package.version.length)
            res.send(package.version)
        })
    }

    getBundles(req, res) {
        Payload.findOne({ bundle: req.query.bundle, channel: req.query.channel }).sort({ _id: -1 }).exec((err, package) => {
            if (err) {
                res.status(500)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            if (package === null) {
                res.status(404)
                res.setHeader('Server', this.serverHeader)
                res.send()
                return
            }

            if (req.influxdb) {
                req.influxdb.writeMeasurement('payload', [{
                    tags: { bundle: package.bundle, channel: package.channel },
                    fields: { count: 1 },
                    timestamp: new Date()
                }])
            }

            const stat = fs.statSync(package.path + '.bin')

            res.status(200)
            res.setHeader('Server', this.serverHeader)
            res.setHeader('Content-Type', `application/octet-stream`)
            res.setHeader('Content-Length', stat.size)
            res.setHeader('Content-Disposition', `attachment; filename="${ package.bundle }-${ package.channel }.bin"`)
            res.setHeader('X-Version-Number', package.version)

            fs.createReadStream(package.path + '.bin').pipe(res)
        })
    }
}