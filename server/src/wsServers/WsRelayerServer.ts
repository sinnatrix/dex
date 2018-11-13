import * as WebSocket from 'ws'
import * as R from 'ramda'
import log from '../utils/log'
import config from '../config'
import { convertOrderToSRA2Format } from '../utils/helpers'
import { validateNetworkId, validateRequiredField } from '../validation'

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
      path: config.RELAYER_API_V2_PATH
    })

    wss.on('connection', ws => {
      log.info('connection')

      ws.on('message', async rawMessage => {
        const message = JSON.parse(rawMessage)
        const { type, channel, requestId, payload } = message

        if (type === 'subscribe' && channel === 'orders') {
          const validationErrors = [
            validateNetworkId(payload.networkId),
            validateRequiredField('requestId', requestId)
          ].filter(one => !!one)

          if (validationErrors.length) {
            ws.send(JSON.stringify({
              code: 100,
              reason: 'Validation failed',
              validationErrors
            }))
            return
          }

          this.subscribeClient({ ws, payload, requestId })
        }

        if (type === 'unsubscribe') {
          this.unsubscribeClient(ws)
        }
      })

      ws.on('close', () => {
        this.unsubscribeClient(ws)
      })
    })
  }

  subscribeClient ({ ws, payload, requestId }) {
    const found = !!this.clients.filter(one => one.ws === ws)[0]

    if (!found) {
      this.clients = [
        ...this.clients,
        { ws, subscriptions: [] }
      ]
    }

    this.clients = this.clients.map(one => {
      if (one.ws !== ws) {
        return one
      }

      return {
        ...one,
        subscriptions: [
          ...one.subscriptions,
          { payload, requestId }
        ]
      }
    })
  }

  unsubscribeClient (ws) {
    this.clients = this.clients.filter(one => one.ws !== ws)
  }

  pushOrder (order) {
    const clients = this.findClientSubscriptionsForOrder(order)
    const sra2Order = convertOrderToSRA2Format(order)

    clients.forEach(client => {
      client.subscriptions.forEach(subscription => {
        client.ws.send(JSON.stringify(
          {
            type: 'update',
            channel: 'orders',
            requestId: subscription.requestId,
            payload: [ sra2Order ]
          }
        ))
      })
    })
  }

  findClientSubscriptionsForOrder (order) {
    return this.clients
      .map(client => ({
        ...client,
        subscriptions: client.subscriptions.filter(subscription => {
          return R.equals(
            R.pick(
              Object.keys(subscription.payload),
              order
            ),
            subscription.payload
          )
        })
      }))
      .filter(one => one.subscriptions.length > 0)
  }
}

export default WsRelayerServer
