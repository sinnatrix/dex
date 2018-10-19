const { ZeroEx } = require('0x.js')
const { BigNumber } = require('@0xproject/utils')

class OrderBlockchainService {
  constructor ({ blockchainService }) {
    this.blockchainService = blockchainService
  }

  toZeroExOrder (order) {
    const fields = [
      'expirationUnixTimestampSec',
      'makerFee',
      'makerTokenAmount',
      'salt',
      'takerFee',
      'takerTokenAmount'
    ]

    const result = {}

    Object.keys(order).forEach(key => {
      if (fields.indexOf(key) === -1) {
        result[key] = order[key]
      } else {
        result[key] = new BigNumber(order[key])
      }
    })

    return result
  }

  async fillInBlockchain (order) {
    const provider = this.blockchainService.getProvider()

    const zeroEx = new ZeroEx(provider, {
      networkId: parseInt(process.env.NETWORK_ID, 10)
    })

    // Get token information
    const wethTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('WETH')
    const zrxTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('ZRX')

    // Check if either getTokenIfExistsAsync query resulted in undefined
    if (wethTokenInfo === undefined || zrxTokenInfo === undefined) {
      throw new Error('could not find token info')
    }

    // Get token contract addresses
    const WETH_ADDRESS = wethTokenInfo.address
    const ZRX_ADDRESS = zrxTokenInfo.address

    console.log('tokens: ', { WETH_ADDRESS, ZRX_ADDRESS })

    await this.validateInBlockchain(order)
  }

  async validateInBlockchain (order) {
    const provider = this.blockchainService.getProvider()

    const zeroEx = new ZeroEx(provider, {
      networkId: parseInt(process.env.NETWORK_ID, 10)
    })

    const data = this.toZeroExOrder(order)

    await zeroEx.exchange.validateOrderFillableOrThrowAsync(data)
  }
}

module.exports = OrderBlockchainService
