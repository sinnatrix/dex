import 'regenerator-runtime/runtime'
import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import { createConnection } from 'typeorm'
import log from './utils/log'
import ormconfig from '../ormconfig'
import WsOwnServer from './wsServers/WsOwnServer'
import WsRelayerServer from './wsServers/WsRelayerServer'
import V1OwnController from './controllers/V1OwnController'
import V0RelayerController from './controllers/V0RelayerController'
const { createContainer, asValue, asClass } = require('awilix')

;(async () => {
  const connection = await createConnection(ormconfig as any)

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
})().catch(console.error)
