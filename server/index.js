const Config = require('./models/Config')
Config.initBasic()

const express = require('express')
const bodyParser = require('body-parser')
const log = require('./utils/log')
const mongoose = require('mongoose')
const http = require('http')
// const wsRelayerServer = require('./wsRelayerServer')
const wsOwnServer = require('./wsOwnServer')

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {useNewUrlParser: true}).then(Config.init).catch(console.error)

const app = express()

const server = http.createServer(app)

const RELAYER_API_PATH = '/api/relayer/v0'
const OWN_API_PATH = '/api/v1'

// wsRelayerServer(RELAYER_API_PATH, server)
wsOwnServer(OWN_API_PATH, server)

const v0Relayer = require('./routes/v0Relayer')
const v1Own = require('./routes/v1Own')

app.use(bodyParser.json())
app.use(RELAYER_API_PATH, v0Relayer)
app.use(OWN_API_PATH, v1Own)

server.listen(process.env.PORT, () => {
  log.info('started server on port', process.env.PORT)
})
