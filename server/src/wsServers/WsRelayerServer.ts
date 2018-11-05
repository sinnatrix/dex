import * as WebSocket from 'ws'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'
import config from '../config'

class WsRelayerServer {
  clients: any[]
  server: any
  connection: any

  constructor ({ server, connection }) {
    this.clients = []
    this.server = server
    this.connection = connection
  }

  attach () {
    const wss = new WebSocket.Server({
      server: this.server,
      path: config.RELAYER_API_PATH
    })

    wss.on('connection', ws => {
      log.info('connection')
      this.clients.push(ws)

      ws.on('message', async rawMessage => {
        const message = JSON.parse(rawMessage)
        const { type, channel, requestId, payload } = message

        if (type === 'subscribe' && channel === 'orderbook') {
          const { baseAssetAddress, quoteAssetAddress } = payload
          const repository = this.connection.getCustomRepository(OrderRepository)
          const { asks, bids } = await repository.generateOrderbook({ baseAssetAddress, quoteAssetAddress })

          const reply = {
            type: 'snapshot',
            channel: 'orderbook',
            requestId,
            payload: {
              asks,
              bids
            }
          }

          ws.send(JSON.stringify(reply))
        }
      })

      ws.on('close', () => {
        log.info('close')
        const index = this.clients.indexOf(ws)
        this.clients.splice(index, 1)
      })
    })
  }
}

export default WsRelayerServer
