import 'regenerator-runtime/runtime'
import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import { createConnection } from 'typeorm'
import log from './utils/log'
import ormconfig from '../ormconfig'
import makeWebsocketServerFactory from './factories/makeWebsocketServerFactory'
import WsRelayerServer from './wsRelayerServer/WsRelayerServer'
import V1OwnController from './controllers/V1OwnController'
import V0RelayerController from './controllers/V0RelayerController'
import BlockchainService from './services/BlockchainService'
import OrderBlochainService from './services/OrderBlockchainService'
import TradeHistoryService from './services/TradeHistoryService'
const { createContainer, asValue, asClass, asFunction } = require('awilix')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

;(async () => {
  let connection
  do {
    try {
      connection = await createConnection(ormconfig as any)
    } catch (e) {
      console.error(e.message)
      await delay(2000)
      console.log('Trying to connect to db...')
    }
  } while (!connection)

  const application = express()

  const server = http.createServer(application)

  application.use(bodyParser.json())

  const container = createContainer()
  container.register({
    application: asValue(application),
    server: asValue(server),
    connection: asValue(connection),
    wsRelayerServer: asClass(WsRelayerServer).singleton(),
    v1OwnController: asClass(V1OwnController).singleton(),
    v0RelayerController: asClass(V0RelayerController).singleton(),
    blockchainService: asClass(BlockchainService).singleton(),
    orderBlockchainService: asClass(OrderBlochainService).singleton(),
    tradeHistoryService: asClass(TradeHistoryService).singleton(),
    websocketServerFactory: asFunction(makeWebsocketServerFactory).singleton()
  })

  container.resolve('wsRelayerServer').attach()
  container.resolve('v1OwnController').attach()
  container.resolve('v0RelayerController').attach()
  container.resolve('tradeHistoryService').attach()

  container.resolve('server').listen(process.env.PORT, () => {
    log.info('started server on port', process.env.PORT)
  })
})().catch(e => {
  console.error(e)
})
