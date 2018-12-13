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
import V2RelayerController from './controllers/V2RelayerController'
import TransactionBlockchainService from './services/TransactionBlockchainService'
import OrderBlochainService from './services/OrderBlockchainService'
import TradeHistoryService from './services/TradeHistoryService'
import OrderService from './services/OrderService'
import WebsocketProviderWrapper from './services/WebsocketProviderWrapper'
const { createContainer, asValue, asClass, asFunction } = require('awilix')
const Web3 = require('web3')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const makeHttpProvider = () => {
  return new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL as string)
}

const makeWebsocketProvider = () => {
  return new Web3.providers.WebsocketProvider(process.env.WS_INFURA_HOST as string)
}

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
    networkId: asValue(parseInt(process.env.NETWORK_ID as string, 10)),
    wsRelayerServer: asClass(WsRelayerServer).singleton(),
    v1OwnController: asClass(V1OwnController).singleton(),
    v2RelayerController: asClass(V2RelayerController).singleton(),
    contractAddresses: asValue(undefined),
    httpProvider: asValue(makeHttpProvider()),
    makeWebsocketProvider: asValue(makeWebsocketProvider),
    websocketProviderWrapper: asClass(WebsocketProviderWrapper).singleton(),
    transactionBlockchainService: asClass(TransactionBlockchainService).singleton(),
    orderBlockchainService: asClass(OrderBlochainService).singleton(),
    tradeHistoryService: asClass(TradeHistoryService).singleton(),
    websocketServerFactory: asFunction(makeWebsocketServerFactory).singleton(),
    orderService: asClass(OrderService).singleton()
  })

  container.resolve('websocketProviderWrapper').attach()

  container.resolve('wsRelayerServer').attach()
  container.resolve('v1OwnController').attach()
  container.resolve('v2RelayerController').attach()
  container.resolve('tradeHistoryService').attach()

  container.resolve('server').listen(process.env.PORT, () => {
    log.info('started server on port', process.env.PORT)
  })
})().catch(e => {
  console.error(e)
})
