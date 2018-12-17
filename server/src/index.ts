import 'regenerator-runtime/runtime'
import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import { createConnection } from 'typeorm'
import log from './utils/log'
import ormconfig from '../ormconfig'
import createAppContainer from './container'

const { asValue } = require('awilix')

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

  container.resolve('websocketProviderWrapper').attach()
  container.resolve('wsRelayerServer').attach()
  container.resolve('v1OwnController').attach()
  container.resolve('v2RelayerController').attach()
  container.resolve('tradeHistoryService').attach()
  container.resolve('relayerSocketConnectionService').attach()

  container.resolve('server').listen(process.env.PORT, () => {
    log.info('started server on port', process.env.PORT)
  })
})().catch(e => {
  console.error(e)
})
