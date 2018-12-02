import { TChannel, IOutputMessage } from './types'
const sift = require('sift').default

class WsRelayerServerSubscription {
  ws: any
  payload: any
  channel: TChannel
  requestId: string

  constructor ({ ws, payload, channel, requestId }) {
    this.ws = ws
    this.payload = payload
    this.channel = channel
    this.requestId = requestId
  }

  isSuitable (channel, data) {
    return this.channel === channel &&
      sift(this.payload, data).length > 0
  }

  sendData (data) {
    const message: IOutputMessage = {
      type: 'update',
      channel: this.channel,
      requestId: this.requestId,
      payload: data
    }

    this.ws.send(JSON.stringify(message))
  }
}

export default WsRelayerServerSubscription
