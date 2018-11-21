import * as WebSocket from 'ws'
import * as R from 'ramda'
import log from '../utils/log'
import config from '../config'
import { convertOrderToSRA2Format } from '../utils/helpers'
import { validateNetworkId, validateRequiredField } from '../validation'
const sift = require('sift').default

const validateNetworkIdRule = params => validateNetworkId(params.payload.networkId)
const validateRequestIdRule = params => validateRequiredField('requestId', params.requestId)

const channels = {
  orders: {
    rules: [
      validateNetworkIdRule,
      validateRequestIdRule
    ]
  },
  tradeHistory: {
    rules: [
      validateRequestIdRule
    ]
  }
}

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

      ws.on('message', rawMessage => {
        const message = JSON.parse(rawMessage)
        const { type, channel, requestId, payload } = message

        if (type === 'subscribe') {
          this.subscribeClient(ws, channel, requestId, payload)
        }

        if (type === 'unsubscribe') {
          this.unsubscribeClient(ws, channel)
        }
      })

      ws.on('close', () => {
        this.unsubscribeClient(ws)
      })
    })
  }

  subscribeClient (ws, channel, requestId: string, payload: {}) {
    if (!channels[channel]) {
      ws.send(JSON.stringify({
        code: 100,
        reason: 'Wrong channel'
      }))

      return
    }

    const { rules } = channels[channel]
    const validationErrors = rules
      .map(rule =>
        rule({ payload, requestId })
      )
      .filter(one => !!one)

    if (validationErrors.length) {
      ws.send(JSON.stringify({
        code: 100,
        reason: 'Validation failed',
        validationErrors
      }))
      log.info(`Validation for ${channel} failed`)
      return
    }

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
          { payload, channel, requestId }
        ]
      }
    })

    log.info(`New subscription for ${channel} was made`)
  }

  unsubscribeClient (ws, channel = '') {
    if (channel === '') {
      this.clients = this.clients.filter(one => one.ws !== ws)
      return
    }

    this.clients = this.clients
      .map(client => ({
        ...client,
        subscriptions: sift({ channel: { $eq: channel }}, client.subscriptions) // .filter(subscription => subscription.channel !== channel)
      }))
      .filter(one => one.subscriptions.length > 0)
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
    const clients = this.findClientSubscriptionsForChannel('orders')

    return clients.map(client => ({
      ...client,
      subscriptions: client.subscriptions
        .filter(subscription => {
          return sift(
            R.pick(
              Object.keys(subscription.payload),
              order
            ),
            [ subscription.payload ]
          ).length > 0
        }
      )
    }))
    .filter(one => one.subscriptions.length > 0)
  }

  findClientSubscriptionsForChannel (channel) {
    return this.clients
      .map(client => ({
        ...client,
        subscriptions: client.subscriptions.filter(subscription => subscription.channel === channel)
      }))
      .filter(one => one.subscriptions.length > 0)
  }

  pushTradeHistory (tradeHistoryItem) {
    const clients = this.findClientSubscriptionsForTradeHistory(tradeHistoryItem)

    clients.forEach(client => {
      client.subscriptions.forEach(subscription => {
        client.ws.send(JSON.stringify(
          {
            type: 'update',
            channel: 'tradeHistory',
            requestId: subscription.requestId,
            payload: [ tradeHistoryItem ]
          }
        ))
      })
    })
  }

  findClientSubscriptionsForTradeHistory (tradeHistoryItem) {
    const clients = this.findClientSubscriptionsForChannel('tradeHistory')

    return clients.map(client => ({
      ...client,
      subscriptions: client.subscriptions.filter(subscription => {
        return sift(
          subscription.payload,
          [ tradeHistoryItem ]
        ).length > 0
      })
    }))
    .filter(one => one.subscriptions.length > 0)
  }
}

export default WsRelayerServer
