// Kosmos Updater Server
// Copyright (C) 2018 Nichole Mattera
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

const express = require('express')
const config = require('./config.json')
const v1 = require('./routes/v1.route')
const v2 = require('./routes/v2.route')
const v3 = require('./routes/v3.route')

// Setup Express
const app = express()
app.use('/v1', v1)
app.use('/v2', v2)
app.use('/v3', v3)
app.listen(config.portNumber, () => {
    console.log(`Server is listening on ${ config.portNumber }`)
})
