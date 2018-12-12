import { getRepository, getCustomRepository } from 'typeorm'
import RelayerEntity from '../entities/Relayer'
import AssetPairEntity from '../entities/AssetPair'
import OrderRepository from '../repositories/OrderRepository'
const ZeroEx = require('0x.js')

class LoadOrderbookTask {
  relayerService: any

  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(RelayerEntity).findOne({ name: 'Radar Relay' })

    if (!relayer) {
      return
    }

    const tokenPair: any = await getRepository(AssetPairEntity).findOne()

    const orderbook = await this.relayerService.loadOrderbook(relayer, {
      baseAssetAddress: tokenPair.tokenAAddress,
      quoteAssetAddress: tokenPair.tokenBAddress
    })

    const orders = orderbook.bids.concat(orderbook.asks)

    const orderRepository = getCustomRepository(OrderRepository)

    for (let order of orders) {
      const orderHash = ZeroEx.getOrderHashHex(order)
      try {
        await orderRepository.save({
          ...order,
          orderHash
        })
      } catch (e) {
        console.log('e: ', e)
      }
    }
  }
}

export default LoadOrderbookTask
