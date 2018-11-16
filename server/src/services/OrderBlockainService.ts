import { ContractWrappers } from '0x.js'

class OrderBlockchainService {
  blockchainService: any
  contractWrappers: any
  web3: any
  contract: any

  constructor ({ blockchainService }) {
    this.blockchainService = blockchainService

    this.contractWrappers = new ContractWrappers(
      this.blockchainService.getProvider(),
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    this.web3 = this.blockchainService.getWeb3()

    this.contract = new this.web3.eth.Contract(
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
   *
   * @param orderHash
   * @param fromBlock
   */
  loadOrderHistory ({ orderHash, fromBlock = 0}) {
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
