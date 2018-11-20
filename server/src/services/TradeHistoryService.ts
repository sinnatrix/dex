import { ContractWrappers } from '0x.js'
import BlockchainService from './BlockchainService'
import { convertFillEventToDexTradeHistory } from '../utils/helpers'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import log from '../utils/log'

class TradeHistoryService {
  blockchainService: BlockchainService
  contractWrappers: ContractWrappers
  wsContractWrappers: ContractWrappers
  contract: any
  wsContract: any
  tradeHistoryRepository: TradeHistoryRepository

  constructor ({ connection, blockchainService }) {
    this.blockchainService = blockchainService

    this.contractWrappers = new ContractWrappers(
      this.blockchainService.httpProvider,
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    this.wsContractWrappers = new ContractWrappers(
      this.blockchainService.wsProvider,
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    this.contract = new this.blockchainService.web3.eth.Contract(
      this.contractWrappers.exchange.abi,
      this.contractWrappers.exchange.address
    )

    this.wsContract = new this.blockchainService.wsWeb3.eth.Contract(
      this.contractWrappers.exchange.abi,
      this.contractWrappers.exchange.address
    )

    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
  }

  async attach () {
    await this.loadFullTradeHistory()
    await this.subscribeToTradeHistoryEvents()
  }

  async loadFullTradeHistory () {
    log.info('Loading full trade history from exchange')

    let fromBlock = await this.tradeHistoryRepository.getMaxBlockNumber()

    fromBlock += fromBlock > 0 ? 1 : 0
    let toBlock = 'latest'
    let fillEvents = []

    // TODO Remove when infura fixed
    let attempts = 15
    while (attempts > 0) {
      const result = await this.contract.getPastEvents('Fill', { fromBlock, toBlock })

      if (result.length > fillEvents.length) {
        fillEvents = result
      }

      log.info(`Attempts left ${attempts}: Loaded ${fillEvents.length} events from #${fromBlock} to ${toBlock} blocks`)

      attempts--
    }

    const tradeHistoryItems = fillEvents.map(convertFillEventToDexTradeHistory)
    await this.tradeHistoryRepository.saveFullTradeHistory(tradeHistoryItems)

    console.info('loaded!')
  }

  async subscribeToTradeHistoryEvents () {
    log.info('Subscription to Fill event via websocket provider')

    this.wsContract.events.Fill()
      .on(
        'data',
        async fillEvent => {
          await this.tradeHistoryRepository
            .saveFullTradeHistory([convertFillEventToDexTradeHistory(fillEvent)])
        }
      )
      .on('error', async error => {
        console.error('Connection error: ', error, 'trying to reconnect')
        await this.subscribeToTradeHistoryEvents()
      })
  }
}

export default TradeHistoryService
