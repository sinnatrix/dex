const Config = require('./models/Config')
Config.initBasic()

const express = require('express')
const bodyParser = require('body-parser')
const log = require('./utils/log')
const mongoose = require('mongoose')
const WebSocket = require('ws')
const http = require('http')
const Order = require('./models/Order')
const clients = require('./clients')

mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`).then(Config.init).catch(console.error)

const app = express()

const server = http.createServer(app)

const wss = new WebSocket.Server({
  server
})

const v0Relayer = require('./routes/v0Relayer')
const v1Own = require('./routes/v1Own')

app.use(bodyParser.json())
app.use('/api/relayer/v0', v0Relayer)
app.use('/api/v1', v1Own)

wss.on('connection', function connection (ws) {
  log.info('connection')
  clients.push(ws)

  ws.on('message', async function incoming (rawMessage) {
    const message = JSON.parse(rawMessage)
    const {type, channel, requestId, payload} = message

    if (type === 'subscribe' && channel === 'orderbook') {
      const {baseTokenAddress, quoteTokenAddress} = payload
      const orderbook = await Order.generateOrderbook({baseTokenAddress, quoteTokenAddress})

      const reply = {
        type: 'snapshot',
        channel: 'orderbook',
        requestId,
        payload: orderbook
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

server.listen(process.env.PORT, () => {
  log.info('started server on port', process.env.PORT)
})
