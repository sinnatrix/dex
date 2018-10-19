require('@babel/register')({
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { legacy: true }]
  ]
})

require('dotenv/config')

const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const typeorm = require('typeorm')
const { createContainer, asValue, asClass } = require('awilix')
const log = require('./utils/log')
const ormconfig = require('../ormconfig')
const WsOwnServer = require('./wsServers/WsOwnServer')
const WsRelayerServer = require('./wsServers/WsRelayerServer')
const V1OwnController = require('./controllers/V1OwnController')
const V0RelayerController = require('./controllers/V0RelayerController')

;(async () => {
  const connection = await typeorm.createConnection(ormconfig)

  const application = express()

  const server = http.createServer(application)

  application.use(bodyParser.json())

  const container = createContainer()
  container.register({
    application: asValue(application),
    server: asValue(server),
    connection: asValue(connection),
    wsOwnServer: asClass(WsOwnServer).singleton(),
    wsRelayerServer: asClass(WsRelayerServer).singleton(),
    v1OwnController: asClass(V1OwnController).singleton(),
    v0RelayerController: asClass(V0RelayerController).singleton()
  })

  container.resolve('wsOwnServer').attach()
  container.resolve('v1OwnController').attach()
  container.resolve('v0RelayerController').attach()

  container.resolve('server').listen(process.env.PORT, () => {
    log.info('started server on port', process.env.PORT)
  })
})()
