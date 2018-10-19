const WebSocket = require('ws')
const OrderRepository = require('./repositories/OrderRepository')
const log = require('./utils/log')
const config = require('./config')

class WsOwnServer {
  constructor ({ server, connection }) {
    this.clients = []
    this.server = server
    this.connection = connection
  }

  attach () {
    const wss = new WebSocket.Server({
      server: this.server,
      path: config.OWN_API_PATH
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
            payload: { asks, bids }
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

module.exports = WsOwnServer
