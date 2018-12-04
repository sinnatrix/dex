import OrderBlockchainService from './OrderBlockchainService'
import { convertFillEventToDexTradeHistory } from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
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

  constructor ({ connection, orderBlockchainService, wsRelayerServer, orderService }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.wsRelayerServer = wsRelayerServer
    this.orderService = orderService
  }

  async attach () {
    if (!process.env.LOAD_TRADE_HISTORY_ON_STARTUP || process.env.LOAD_TRADE_HISTORY_ON_STARTUP === 'yes') {
      await this.loadFullTradeHistory()
    }

    await this.subscribeToTradeHistoryEvents()
  }

  async loadFullTradeHistory () {
    log.info('Loading full trade history from exchange')

    let fromBlock = await this.tradeHistoryRepository.getMaxBlockNumber()

    fromBlock++

    let fillEvents: IFillEventLog[] = []

    // TODO Remove when infura fixed
    let attempts = 10
    while (attempts > 0) {
      const result = await this.orderBlockchainService.getPastEvents('Fill', { fromBlock })

      if (result.length > fillEvents.length) {
        fillEvents = result
      }

      log.info(`Attempts left ${attempts}: Loaded ${fillEvents.length} events from #${fromBlock} blocks`)

      attempts--
    }

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
    this.wsRelayerServer.pushUpdate(
      'tradeHistory',
      [tradeHistoryItem],
      [tradeHistoryItem]
    )

    await this.orderService.updateOrderInfoByHash(tradeHistoryItem.orderHash)

    return this.tradeHistoryRepository
      .saveFullTradeHistory([tradeHistoryItem])
  }
}

export default TradeHistoryService
