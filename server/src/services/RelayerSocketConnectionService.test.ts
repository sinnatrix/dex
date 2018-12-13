import RelayerSocketConnectionService from './RelayerSocketConnectionService'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import RelayerRepository from '../repositories/RelayerRepository'
import { convertSignedOrderToSignedOrderWithStrings, delay } from '../utils/helpers'
import { generateSRA2Order } from '../utils/testUtils'
import * as http from 'http'
import * as WebSocket from 'ws'
import SocketService from './SocketService'
import { IWsRelayer } from '../types'
import WsRelayerServerFacade from '../wsRelayerServer/WsRelayerServerFacade'
import OrderRepository from '../repositories/OrderRepository'
import config from '../config'
const test = require('tape')
const sinon = require('sinon')

test('RelayerSocketConnectionService', t => {
  t.test('remote order pushed to our clients', async t => {
    const PORT = 17123

    const server = http.createServer()

    server.listen(PORT)

    const websocketServerFactory = options => new WebSocket.Server(options)
    const websocketClientFactory = (url: string): SocketService => new SocketService(url)

    const wsRelayerRemoteServer = new WsRelayerServer({
      server,
      websocketServerFactory
    })
    wsRelayerRemoteServer.attach()

    const relayerRepository = {
      async getAllActiveWithWsEndpoint (): Promise<IWsRelayer[]> {
        return [
          {
            id: '123',
            active: true,
            homepageUrl: '',
            name: 'Localhost',
            sraWsEndpoint: `ws://127.0.0.1:${PORT}${config.RELAYER_API_V2_PATH}`
          }
        ]
      }
    }

    const orderRepository = {
      insertIgnore: sinon.fake()
    }

    const connection = {
      getCustomRepository (repositoryConstructor) {
        if (repositoryConstructor === RelayerRepository) {
          return relayerRepository
        }
        if (repositoryConstructor === OrderRepository) {
          return orderRepository
        }
      }
    }

    const wsRelayerServer = {
      pushUpdate: sinon.fake()
    }

    const relayerSocketConnectionService = new RelayerSocketConnectionService({
      wsRelayerServer,
      connection,
      networkId: 42,
      websocketClientFactory
    })

    await relayerSocketConnectionService.attach()

    await delay(200)

    const sra2Order = generateSRA2Order()

    WsRelayerServerFacade.pushOrders(wsRelayerRemoteServer, [sra2Order])

    await delay(20)

    t.equal(wsRelayerServer.pushUpdate.callCount, 1)

    const lastCallArgs = wsRelayerServer.pushUpdate.lastCall.args
    t.equal(lastCallArgs[0], 'orders')
    t.deepEqual(lastCallArgs[1], [
      {
        order: convertSignedOrderToSignedOrderWithStrings(sra2Order.order),
        metaData: {
          ...sra2Order.metaData,
          orderTakerAssetFilledAmount: sra2Order.metaData.orderTakerAssetFilledAmount.toString()
        }
      }
    ])

    relayerSocketConnectionService.cleanup()
    server.close()

    t.end()
  })
})
