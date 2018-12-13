import log from '../utils/log'
import { TChannel } from './types'
import WsRelayerServerSubcsription from './WsRelayerServerSubscription'

class WsRelayerServerSubscriptionsStorage {
  subscriptions: WsRelayerServerSubcsription[] = []

  add (subscription: WsRelayerServerSubcsription) {
    this.subscriptions = [...this.subscriptions, subscription]

    log.info(`New subscription for ${subscription.channel} was made`)
  }

  remove (ws, requestId?) {
    if (!requestId) {
      this.subscriptions = this.subscriptions.filter(one => one.ws !== ws)
      return
    }

    this.subscriptions = this.subscriptions.filter(subscription =>
      !(subscription.requestId === requestId && subscription.ws === ws)
    )
  }

  find (channel: TChannel, data: any[]): WsRelayerServerSubcsription[] {
    return this.subscriptions.filter(subscription => subscription.isSuitable(channel, data))
  }

  getAll () {
    return this.subscriptions
  }
}

export default WsRelayerServerSubscriptionsStorage
