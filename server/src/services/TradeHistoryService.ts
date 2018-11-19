import { ContractWrappers } from '0x.js'
import BlockchainService from './BlockchainService'
import { convertTradeHistoryToDexFormat } from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import log from '../utils/log'

class TradeHistoryService {
  blockchainService: BlockchainService
  contractWrappers: ContractWrappers
  contract: any
  tradeHistoryRepository: any

  constructor ({ connection, blockchainService }) {
    this.blockchainService = blockchainService

    this.contractWrappers = new ContractWrappers(
      this.blockchainService.provider,
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    this.contract = new this.blockchainService.web3.eth.Contract(
      this.contractWrappers.exchange.abi,
      this.contractWrappers.exchange.address
    )

    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
  }

  attach () {
    this.loadFullTradeHistory()
  }

  async loadFullTradeHistory () {
    log.info('Loading full trade history from exchange')
    const fromBlock = 0

    const tradeHistory = await this.contract.getPastEvents(
      'Fill',
      {
        fromBlock
      }
    )

    const formattedTradeHistory = tradeHistory.map(convertTradeHistoryToDexFormat)

    await this.tradeHistoryRepository.saveFullTradeHistory(formattedTradeHistory)
  }
}

export default TradeHistoryService
