import 'regenerator-runtime/runtime'
import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import { asValue } from 'awilix'
import { createConnection } from 'typeorm'
import log from './utils/log'
import ormconfig from '../ormconfig'
import createAppContainer from './container'
import WebsocketProviderWrapper from './services/WebsocketProviderWrapper'
import WsRelayerServer from './wsRelayerServer/WsRelayerServer'
import V1OwnController from './controllers/V1OwnController'
import V2RelayerController from './controllers/V2RelayerController'
import TradeHistoryService from './services/TradeHistoryService'
import RelayerSocketConnectionService from './services/RelayerSocketConnectionService'
import CronService from './services/CronService'

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

  const container = createAppContainer({ connection })

  container.register({
    application: asValue(application),
    server: asValue(server)
  })

  container.resolve<WebsocketProviderWrapper>('websocketProviderWrapper').attach()
  container.resolve<WsRelayerServer>('wsRelayerServer').attach()
  container.resolve<V1OwnController>('v1OwnController').attach()
  container.resolve<V2RelayerController>('v2RelayerController').attach()
  container.resolve<TradeHistoryService>('tradeHistoryService').attach()
  container.resolve<RelayerSocketConnectionService>('relayerSocketConnectionService').attach()
  container.resolve<CronService>('cronService').attach()

  container.resolve<http.Server>('server').listen(process.env.PORT, () => {
    log.info('started server on port', process.env.PORT)
  })
})().catch(e => {
  console.error(e)
})
