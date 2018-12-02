import log from '../utils/log'
import config from '../config'
import { IInputMessage, TChannel } from './types'
import WsRelayerServerSubscriptionsStorage from './WsRelayerServerSubscriptionsStorage'
import WsRelayerServerValidator from './WsRelayerServerValidator'
import WsRelayerServerSubscription from './WsRelayerServerSubscription'
import WsRelayerServerError from './WsRelayerServerError'

interface IConstructorOptions {
  wsRelayerServerValidator?: WsRelayerServerValidator
  wsRelayerServerSubscriptionsStorage?: WsRelayerServerSubscriptionsStorage
}

class WsRelayerServer {
  server: any
  connection: any
  websocketServerFactory: any

  subscriptionsStorage: WsRelayerServerSubscriptionsStorage
  validator: WsRelayerServerValidator

  constructor ({
    server,
    websocketServerFactory
  }, {
    wsRelayerServerValidator,
    wsRelayerServerSubscriptionsStorage
  }: IConstructorOptions = {}) {
    this.server = server
    this.websocketServerFactory = websocketServerFactory

    this.subscriptionsStorage = wsRelayerServerSubscriptionsStorage || new WsRelayerServerSubscriptionsStorage()
    this.validator = wsRelayerServerValidator || new WsRelayerServerValidator()
  }

  attach () {
    const wss = this.websocketServerFactory({
      server: this.server,
      path: config.RELAYER_API_V2_PATH
    })

    wss.on('connection', ws => {
      log.info('connection')

      ws.on('message', rawMessage => {
        const message: IInputMessage = JSON.parse(rawMessage)

        if (message.type === 'subscribe') {
          this.handleSubscribe(ws, message)
        }

        if (message.type === 'unsubscribe') {
          this.handleUnsubscribe(ws, message)
        }
      })

      ws.on('close', () => {
        this.handleClose(ws)
      })
    })
  }

  handleSubscribe (ws, message: IInputMessage) {
    try {
      this.validator.validateMessage(message)

      const subscription = new WsRelayerServerSubscription({
        ws,
        channel: message.channel,
        payload: message.payload,
        requestId: message.requestId
      })

      this.subscriptionsStorage.add(subscription)
    } catch (e) {
      if (e instanceof WsRelayerServerError) {
        ws.send(JSON.stringify(e.serialize()))
      } else {
        throw e
      }
    }
  }

  handleUnsubscribe (ws, message: IInputMessage) {
    this.subscriptionsStorage.remove(ws, message.requestId)
  }

  handleClose (ws) {
    this.subscriptionsStorage.remove(ws)
  }

  pushUpdate (channel: TChannel, data, toFilter) {
    this.validator.validateChannel(channel)

    const subscriptions = this.subscriptionsStorage.find(channel, toFilter)

    subscriptions.forEach(subscription => {
      subscription.sendData(data)
    })
  }
}

export default WsRelayerServer
