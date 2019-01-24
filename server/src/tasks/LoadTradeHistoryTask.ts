import OrderBlockchainService from '../services/OrderBlockchainService'
import {
  convertFillEventToDexTradeHistory,
  convertCancelEventToDexEventLogItem,
  getNowUnixtime
} from '../utils/helpers'
import TradeHistory from '../entities/TradeHistory'
import { LoadEventsJobEntity } from '../types'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import JobRepository from '../repositories/JobRepository'

class LoadTradeHistoryTask {
  CHUNK_SIZE_BLOCKS = 2

  orderBlockchainService: OrderBlockchainService
  tradeHistoryRepository: TradeHistoryRepository
  jobRepository: JobRepository

  constructor ({ connection, orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.jobRepository = connection.getCustomRepository(JobRepository)
  }

  async run (job: LoadEventsJobEntity): Promise<LoadEventsJobEntity> {
    const { fromBlock, toBlock } = job
    let chunkSize = this.CHUNK_SIZE_BLOCKS
    let start
    let end
    let activeJob

    const l = Math.ceil((toBlock - fromBlock) / chunkSize)
    for (let i = 1; i <= l; i++) {
      start = fromBlock + (i - 1) * chunkSize
      end = start + chunkSize - 1
      end = end < toBlock ? end : toBlock
      await this.loadTradeHistoryAndSave(start, end)
      activeJob = await this.jobRepository.save({
        ...job,
        updatedAt: getNowUnixtime(),
        currentBlock: end
      } as any)
    }

    return activeJob
  }

  async loadTradeHistoryAndSave (fromBlock, toBlock) {
    const eventsToSave: TradeHistory[] = []

    const fillEvents = await this.orderBlockchainService.loadTradeHistory('Fill', fromBlock, toBlock)
    for (let event of fillEvents) {
      eventsToSave.push(convertFillEventToDexTradeHistory(event))
    }

    const cancelEvents = await this.orderBlockchainService.loadTradeHistory('Cancel', fromBlock, toBlock)
    for (let event of cancelEvents) {
      eventsToSave.push(convertCancelEventToDexEventLogItem(event))
    }

    await this.tradeHistoryRepository.saveFullTradeHistory(eventsToSave)
  }
}

export default LoadTradeHistoryTask
