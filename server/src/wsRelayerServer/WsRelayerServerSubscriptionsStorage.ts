import log from '../utils/log'
import { ISubscription, TChannel } from './types'
const sift = require('sift').default

class WsRelayerServerSubscriptionsStorage {
  subscriptions: ISubscription[] = []

  add (subscription: ISubscription) {
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

  find (channel: TChannel, data: any[]): ISubscription[] {
    console.log('all subscriptions: ', this.subscriptions)
    console.log('channel: ', channel)
    console.log('data: ', data)
    return this.subscriptions
      .filter(subscription => subscription.channel === channel)
      .filter(subscription => sift(subscription.payload, data).length > 0)
  }

  getAll () {
    return this.subscriptions
  }
}

export default WsRelayerServerSubscriptionsStorage
