const WebSocket = require('ws')
const OrderRepository = require('./repositories/OrderRepository')
const log = require('./utils/log')
const config = require('./config')

class WsRelayerServer {
  constructor ({ server }) {
    this.clients = []
    this.server = server
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
          const { baseTokenAddress, quoteTokenAddress } = payload
          const repository = this.connection.getCustomRepository(OrderRepository)
          const { asks, bids } = await repository.generateOrderbook({ baseTokenAddress, quoteTokenAddress })

          const reply = {
            type: 'snapshot',
            channel: 'orderbook',
            requestId,
            payload: {
              asks: asks.map(one => one.data),
              bids: bids.map(one => one.data)
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

module.exports = WsRelayerServer
