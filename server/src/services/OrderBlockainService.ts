import { ContractWrappers } from '0x.js'

class OrderBlockchainService {
  blockchainService: any

  constructor ({ blockchainService }) {
    this.blockchainService = blockchainService
  }

  getFilledTakerAssetAmount (orderHash) {
    const contractWrappers = new ContractWrappers(
      this.blockchainService.getProvider(),
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    return contractWrappers.exchange.getFilledTakerAssetAmountAsync(orderHash)
  }
}

export default OrderBlockchainService
