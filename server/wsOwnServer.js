const WebSocket = require('ws')
const Order = require('./models/Order')
const log = require('./utils/log')
const clients = []

module.exports = function (path, server) {
  const wss = new WebSocket.Server({
    server,
    path
  })

  wss.on('connection', function connection (ws) {
    log.info('connection')
    clients.push(ws)

    ws.on('message', async function incoming (rawMessage) {
      const message = JSON.parse(rawMessage)
      const { type, channel, requestId, payload } = message

      if (type === 'subscribe' && channel === 'orderbook') {
        const { baseTokenAddress, quoteTokenAddress } = payload
        const { asks, bids } = await Order.generateOrderbook({ baseTokenAddress, quoteTokenAddress })

        const reply = {
          type: 'snapshot',
          channel: 'orderbook',
          requestId,
          payload: { asks, bids }
        }

        ws.send(JSON.stringify(reply))
      }
    })

    ws.on('close', function close () {
      log.info('close')
      const index = clients.indexOf(ws)
      clients.splice(index, 1)
    })
  })
}

module.exports.clients = clients
