import OrderBlockchainService from './OrderBlockchainService'
import {
  convertCancelEventToDexEventLogItem,
  convertFillEventToDexTradeHistory,
  delay
} from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'
import { IFillEventLog, EventType } from '../types'
import TradeHistoryEntity from '../entities/TradeHistory'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import OrderService from './OrderService'

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
    await this.subscribeToCancelOrderEvents()

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
      EventType.FILL,
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

    const eventLogItem = convertFillEventToDexTradeHistory(fillEvent)
    await this.saveTradeHistoryAndPush(eventLogItem)

    await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)
  }

  async saveTradeHistoryAndPush (tradeHistoryItem: TradeHistoryEntity) {
    await this.tradeHistoryRepository.saveFullTradeHistory([tradeHistoryItem])
    this.pushTradeHistory(tradeHistoryItem)
  }

  pushTradeHistory (tradeHistoryItem: TradeHistoryEntity) {
    this.wsRelayerServer.pushUpdate(
      'tradeHistory',
      [tradeHistoryItem],
      [tradeHistoryItem]
    )
  }

  async subscribeToCancelOrderEvents (attemptNumber = 1) {
    log.info('Subscription to Cancel event via websocket provider')

    this.orderBlockchainService.subscribe(
      EventType.CANCEL,
      this.handleCancelEvent.bind(this),
      async error => {
        console.error('Connection error: ', error)
        await delay(1000)
        console.log('Trying to reconnect #', attemptNumber)

        if (attemptNumber < this.WS_MAX_CONNECTION_ATTEMPTS) {
          await this.subscribeToCancelOrderEvents(attemptNumber + 1)
        }
      }
    )
  }

  async handleCancelEvent (cancelEvent) {
    log.info('cancelEvent', cancelEvent)

    const eventLogItem = convertCancelEventToDexEventLogItem(cancelEvent)

    await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)

    return this.tradeHistoryRepository
      .saveFullTradeHistory([eventLogItem])
  }
}

export default TradeHistoryService
