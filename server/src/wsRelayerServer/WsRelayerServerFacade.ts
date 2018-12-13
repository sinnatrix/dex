import WsRelayerServer from './WsRelayerServer'
import { ISRA2Order } from '../types'
import { convertOrderToDexFormat } from '../utils/helpers'
import TradeHistoryEntity from '../entities/TradeHistory'

export default class WsRelayerServerFacade {
  static pushOrders (wsRelayerServer: WsRelayerServer, items: ISRA2Order[]) {
    items.forEach(item => wsRelayerServer.pushUpdate(
      'orders',
      [item],
      [convertOrderToDexFormat(item)]
    ))
  }

  static pushTradeHistory (wsRelayerServer: WsRelayerServer, items: TradeHistoryEntity[]) {
    items.forEach(item => wsRelayerServer.pushUpdate(
      'tradeHistory',
      [item],
      [item]
    ))
  }
}
