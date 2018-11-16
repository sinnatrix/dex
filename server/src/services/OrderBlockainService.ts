import { ContractWrappers } from '0x.js'
import BlockchainService from './BlockchainService'

class OrderBlockchainService {
  blockchainService: BlockchainService
  contractWrappers: ContractWrappers
  contract: any

  constructor ({ blockchainService }) {
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
  }

  getFilledTakerAssetAmount (orderHash) {
    return this.contractWrappers.exchange.getFilledTakerAssetAmountAsync(orderHash)
  }

  /**
   * Load order history from blockchain.
   * We load info about past fill events filtered by orderHash so result may contain
   */
  loadOrderHistory (orderHash: string, { fromBlock = 0 } = {}) {
    return this.contract.getPastEvents(
      'Fill',
      {
        fromBlock,
        filter: {
          orderHash
        }
      }
    )
  }
}

export default OrderBlockchainService
