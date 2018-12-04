import OrderBlockchainService from './OrderBlockchainService'
import { convertFillEventToDexTradeHistory, convertDexOrderToSRA2Format } from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'
import { IFillEventLog } from '../types'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import OrderService from './OrderService'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class TradeHistoryService {
  WS_MAX_CONNECTION_ATTEMPTS = 10

  orderBlockchainService: OrderBlockchainService
  tradeHistoryRepository: TradeHistoryRepository
  wsRelayerServer: WsRelayerServer
  orderService: OrderService
  orderRepository: OrderRepository

  constructor ({ connection, orderBlockchainService, wsRelayerServer, orderService }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.wsRelayerServer = wsRelayerServer
    this.orderService = orderService
    this.orderRepository = connection.getCustomRepository(OrderRepository)
  }

  async attach () {
    if (!process.env.LOAD_TRADE_HISTORY_ON_STARTUP || process.env.LOAD_TRADE_HISTORY_ON_STARTUP === 'yes') {
      await this.loadFullTradeHistory()
    }

    await this.subscribeToTradeHistoryEvents()

    // await this.orderService.updateOrdersInfo()
  }

  async loadFullTradeHistory () {
    log.info('Loading full trade history from exchange')

    let fromBlock
    if (process.env.LOAD_TRADE_HISTORY_FROM_BLOCK) {
      fromBlock = parseInt(process.env.LOAD_TRADE_HISTORY_FROM_BLOCK, 10)
    } else {
      fromBlock = await this.tradeHistoryRepository.getMaxBlockNumber()
      fromBlock++
    }

    const fillEvents: IFillEventLog[] = await this.orderBlockchainService.getPastEvents('Fill', { fromBlock })

    log.info(`Loaded ${fillEvents.length} events from #${fromBlock} blocks`)

    const tradeHistoryItems = fillEvents.map(convertFillEventToDexTradeHistory)
    await this.tradeHistoryRepository.saveFullTradeHistory(tradeHistoryItems)

    log.info('Events history loaded')
  }

  async subscribeToTradeHistoryEvents (attemptNumber = 1) {
    log.info('Subscription to Fill event via websocket provider')

    this.orderBlockchainService.subscribe(
      'Fill',
      this.handleFillEvent.bind(this),
      async error => {
        console.error('Connection error: ', error)
        await delay(1000)
        console.log('Trying to reconnect #', attemptNumber)

        if (attemptNumber < this.WS_MAX_CONNECTION_ATTEMPTS) {
          await this.subscribeToTradeHistoryEvents(attemptNumber + 1)
        }
      }
    )
  }

  async handleFillEvent (fillEvent) {
    log.info('fillEvent', fillEvent)

    const tradeHistoryItem = convertFillEventToDexTradeHistory(fillEvent)

    await this.tradeHistoryRepository
      .saveFullTradeHistory([tradeHistoryItem])

    this.wsRelayerServer.pushUpdate(
      'tradeHistory',
      [tradeHistoryItem],
      [tradeHistoryItem]
    )

    await this.orderService.updateOrderInfoByHash(tradeHistoryItem.orderHash)

    const order = await this.orderRepository.findOne({
      where: { orderHash: tradeHistoryItem.orderHash }
    })

    this.wsRelayerServer.pushUpdate(
      'orders',
      [convertDexOrderToSRA2Format(order)],
      [order]
    )
  }
}

export default TradeHistoryService
