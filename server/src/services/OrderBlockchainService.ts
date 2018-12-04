import { ContractWrappers } from '0x.js'
import BlockchainService from './BlockchainService'
import { IEventFilters } from '../types'
import { Order, SignedOrder, MethodOpts, OrderInfo } from '@0x/contract-wrappers'

class OrderBlockchainService {
  blockchainService: BlockchainService
  httpContractWrappers: ContractWrappers
  wsContractWrappers: ContractWrappers
  httpContract: any
  wsContract: any

  constructor ({ blockchainService, networkId, contractAddresses }) {
    this.blockchainService = blockchainService

    /** HTTP transport */
    this.httpContractWrappers = new ContractWrappers(
      this.blockchainService.httpProvider,
      {
        networkId,
        contractAddresses
      }
    )

    this.httpContract = new this.blockchainService.httpWeb3.eth.Contract(
      this.httpContractWrappers.exchange.abi,
      this.httpContractWrappers.exchange.address
    )

    /** websocket transport */
    this.wsContractWrappers = new ContractWrappers(
      this.blockchainService.wsProvider,
      {
        networkId,
        contractAddresses
      }
    )

    this.wsContract = new this.blockchainService.wsWeb3.eth.Contract(
      this.wsContractWrappers.exchange.abi,
      this.wsContractWrappers.exchange.address
    )
  }

  /**
   * Load order history from blockchain.
   * We load info about past fill events filtered by orderHash so result may contain
   */
  loadOrderHistory (orderHash: string, { fromBlock = 0 } = {}) {
    return this.getPastEvents(
      'Fill',
      {
        fromBlock,
        filter: {
          orderHash
        }
      }
    )
  }

  getPastEvents (event, filters: IEventFilters = { fromBlock: 0, toBlock: 'latest', filter: {} }) {
    return this.httpContract.getPastEvents(
      event,
      filters
    )
  }

  subscribe (event, onData: Function, onError: Function) {
    return this.wsContract.events[event]()
      .on('data', onData)
      .on('error', onError)
  }

  getOrderInfoAsync (order: Order | SignedOrder, opts: MethodOpts = {}): Promise<OrderInfo> {
    return this.httpContractWrappers.exchange.getOrderInfoAsync(order, opts)
  }
}

export default OrderBlockchainService
