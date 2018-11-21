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

        /**
         * Standard relayer API
         * WebSocket API Specification v2
         */
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

          const ordersPayload = {
            channel: 'orders',
            filter: payload
          }

          this.subscribeClient(ws, requestId, ordersPayload)
          log.info('New subscription for orders was made')
        }

        /**
         * Internal DEX subscription bellow
         */
        if (type === 'subscribe' && channel === 'tradeHistory') {
          const validationErrors = [
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

          const tradeHistoryPayload = {
            channel: 'tradeHistory',
            filter: payload
          }

          this.subscribeClient(ws, requestId, tradeHistoryPayload)
          log.info('New subscription for tradeHistory was made')
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

  subscribeClient (ws, requestId: string, payload: {}) {
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

  unsubscribeClient (ws, channel = '') {
    if (!!channel) {
      this.clients = this.clients.filter(one => one.ws !== ws)
      return
    }

    this.clients = this.clients
      .map(client => ({
        ...client,
        subscriptions: client.subscriptions.filter(subscription => subscription.payload.channel !== channel)
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
            return R.equals(
              R.pick(
                Object.keys(subscription.payload.filter),
                order
              ),
              subscription.payload.filter
            )
          }
        )
      }))
      .filter(one => one.subscriptions.length > 0)
  }

  findClientSubscriptionsForChannel (channel) {
    return this.clients
      .map(client => ({
        ...client,
        subscriptions: client.subscriptions.filter(subscription => subscription.payload.channel === channel)
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
        const { makerAddress, takerAddress } = subscription.payload.filter
        const isMaker = R.whereEq({ makerAddress })
        const isTaker = R.whereEq({ takerAddress })

        return isMaker(tradeHistoryItem) || isTaker(tradeHistoryItem)
      })
    }))
    .filter(one => one.subscriptions.length > 0)
  }
}

export default WsRelayerServer
