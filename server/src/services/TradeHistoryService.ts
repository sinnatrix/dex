import OrderBlockchainService from './OrderBlockchainService'
import {
  convertCancelEventToDexEventLogItem,
  convertFillEventToDexTradeHistory,
  delay,
  getFillPrice
} from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'
import { IFillEventLog, EventType } from '../types'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import OrderService from './OrderService'
import WsRelayerServerFacade from '../wsRelayerServer/WsRelayerServerFacade'
import { BigNumber } from '@0x/utils'
import AssetPairEntity from '../entities/AssetPair'

class TradeHistoryService {
  WS_MAX_CONNECTION_ATTEMPTS = 10

  orderBlockchainService: OrderBlockchainService
  tradeHistoryRepository: TradeHistoryRepository
  wsRelayerServer: WsRelayerServer
  orderService: OrderService
  orderRepository: OrderRepository

  constructor ({
    connection,
    orderBlockchainService,
    wsRelayerServer,
    orderService
  }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.wsRelayerServer = wsRelayerServer
    this.orderService = orderService
  }

  async attach () {
    await this.subscribeToTradeHistoryEvents()
    await this.subscribeToCancelOrderEvents()
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

  async handleFillEvent (fillEvent: IFillEventLog) {
    log.info('fillEvent', fillEvent)

    const fillEventWithTs = await this.orderBlockchainService.addTimestampToEventLog(fillEvent)
    const eventLogItem = convertFillEventToDexTradeHistory(fillEventWithTs)
    await this.tradeHistoryRepository.saveFullTradeHistory([eventLogItem])

    const tradeHistoryItems = await this.tradeHistoryRepository.getTradeHistoryItemById(eventLogItem.id)

    WsRelayerServerFacade.pushTradeHistory(this.wsRelayerServer, tradeHistoryItems)

    try {
      await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)
    } catch (e) {
      log.error(e.message)
    }
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

    const cancelEventWithTs = await this.orderBlockchainService.addTimestampToEventLog(cancelEvent)
    const eventLogItem = convertCancelEventToDexEventLogItem(cancelEventWithTs)
    await this.tradeHistoryRepository.saveFullTradeHistory([eventLogItem])

    try {
      await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)
    } catch (e) {
      log.error(e.message)
    }
  }

  async getAssetPairLatestPrice (assetPair: AssetPairEntity): Promise<BigNumber> {
    const fill = await this.tradeHistoryRepository.getLatestAssetPairFillEntity(assetPair)
    if (!fill) {
      return new BigNumber(0)
    }

    return getFillPrice(fill, assetPair)
  }

  async getAssetPairLatestPriceExcl24Hours (assetPair: AssetPairEntity): Promise<BigNumber | null> {
    const fill = await this.tradeHistoryRepository.getLatestAssetPairFillEntityExclLast24Hours(assetPair)
    if (!fill) {
      return null
    }

    return getFillPrice(fill, assetPair)
  }
}

export default TradeHistoryService
