import WsRelayerServer from './WsRelayerServer'
import { ISRA2Order, ITradeHistoryItem } from '../types'
import { convertOrderToDexFormat } from '../utils/helpers'

export default class WsRelayerServerFacade {
  static pushOrders (wsRelayerServer: WsRelayerServer, items: ISRA2Order[]) {
    items.forEach(item => wsRelayerServer.pushUpdate(
      'orders',
      [item],
      [convertOrderToDexFormat(item)]
    ))
  }

  static pushTradeHistory (wsRelayerServer: WsRelayerServer, items: ITradeHistoryItem[]) {
    items.forEach(item => wsRelayerServer.pushUpdate(
      'tradeHistory',
      [item],
      [item]
    ))
  }
}
