import OrderBlockchainService from './OrderBlockchainService'
import {
  convertCancelEventToDexEventLogItem,
  convertFillEventToDexTradeHistory,
  delay, getFillPrice
} from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'
import { IFillEventLog, EventType, IDexEventLog, IDexEventLogExtended } from '../types'
import TradeHistoryEntity from '../entities/TradeHistory'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import OrderService from './OrderService'
import WsRelayerServerFacade from '../wsRelayerServer/WsRelayerServerFacade'
import { Block } from 'web3/eth/types'
import { BigNumber } from '@0x/utils'
import AssetPairEntity from '../entities/AssetPair'

const Web3 = require('web3')

class TradeHistoryService {
  WS_MAX_CONNECTION_ATTEMPTS = 10

  orderBlockchainService: OrderBlockchainService
  tradeHistoryRepository: TradeHistoryRepository
  wsRelayerServer: WsRelayerServer
  orderService: OrderService
  orderRepository: OrderRepository
  httpProvider: any

  constructor ({
    orderBlockchainService,
    tradeHistoryRepository,
    orderRepository,
    wsRelayerServer,
    orderService,
    httpProvider
  }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = tradeHistoryRepository
    this.orderRepository = orderRepository
    this.wsRelayerServer = wsRelayerServer
    this.orderService = orderService
    this.httpProvider = httpProvider
  }

  async attach () {
    if (!process.env.LOAD_TRADE_HISTORY_ON_STARTUP || process.env.LOAD_TRADE_HISTORY_ON_STARTUP === 'yes') {
      try {
        await this.loadFullTradeHistory()
      } catch (e) {
        log.info('An unexpected error occured during trade history loading')
        console.error(e)
      }
    }

    await this.subscribeToTradeHistoryEvents()
    await this.subscribeToCancelOrderEvents()
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

    for (let fillEvent of fillEvents) {
      const fillEventWithTs = await this.addTimestampToEventLog(fillEvent)
      const tradeHistoryItem = convertFillEventToDexTradeHistory(fillEventWithTs)
      await this.tradeHistoryRepository.saveFullTradeHistory([tradeHistoryItem])
    }

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

  async handleFillEvent (fillEvent: IFillEventLog) {
    log.info('fillEvent', fillEvent)

    const fillEventWithTs = await this.addTimestampToEventLog(fillEvent)
    const eventLogItem = convertFillEventToDexTradeHistory(fillEventWithTs)
    await this.saveTradeHistoryAndPush(eventLogItem)

    try {
      await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)
    } catch (e) {
      log.error(e.message)
    }
  }

  async saveTradeHistoryAndPush (tradeHistoryItem: TradeHistoryEntity) {
    await this.tradeHistoryRepository.saveFullTradeHistory([tradeHistoryItem])
    WsRelayerServerFacade.pushTradeHistory(this.wsRelayerServer, [tradeHistoryItem])

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

    const cancelEventWithTs = await this.addTimestampToEventLog(cancelEvent)

    const eventLogItem = convertCancelEventToDexEventLogItem(cancelEventWithTs)

    await this.orderService.updateOrderInfoAndPush(eventLogItem.orderHash)

    return this.tradeHistoryRepository
      .saveFullTradeHistory([eventLogItem])
  }

  async addTimestampToEventLog (item: IDexEventLog): Promise<IDexEventLogExtended> {
    const block = await this.getBlockByNumber(item.blockNumber)
    return {
      ...item,
      timestamp: block.timestamp
    }
  }

  async getBlockByNumber (blockNumber: number): Promise<Block> {
    const web3 = new Web3(this.httpProvider)
    let block = await web3.eth.getBlock(blockNumber)

    let i = 0
    while (!block) {
      i++
      await delay(i * 100)
      block = await web3.eth.getBlock(blockNumber)
    }

    return block
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
