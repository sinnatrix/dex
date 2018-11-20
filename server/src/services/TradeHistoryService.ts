import OrderBlockchainService from './OrderBlockchainService'
import { convertFillEventToDexTradeHistory } from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import log from '../utils/log'

class TradeHistoryService {
  WS_MAX_CONNECTION_ATTEMPTS = 10

  orderBlockchainService: OrderBlockchainService
  tradeHistoryRepository: TradeHistoryRepository

  constructor ({ connection, orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
  }

  async attach () {
    await this.loadFullTradeHistory()
    await this.subscribeToTradeHistoryEvents()
  }

  async loadFullTradeHistory () {
    log.info('Loading full trade history from exchange')

    let fromBlock = await this.tradeHistoryRepository.getMaxBlockNumber()

    fromBlock++

    let fillEvents = []

    // TODO Remove when infura fixed
    let attempts = 15
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
      fillEvent => {

        log.info('fillEvent', fillEvent)
        return this.tradeHistoryRepository
          .saveFullTradeHistory([convertFillEventToDexTradeHistory(fillEvent)])
      },
      async error => {
        console.error('Connection error: ', error, 'trying to reconnect #', attemptNumber)
        if (attemptNumber < this.WS_MAX_CONNECTION_ATTEMPTS) {
          await this.subscribeToTradeHistoryEvents(attemptNumber + 1)
        }
      }
    )
  }
}

export default TradeHistoryService
