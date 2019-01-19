import { getRepository, getCustomRepository } from 'typeorm'
import RelayerEntity from '../entities/Relayer'
import { IHttpRelayer } from '../types'
import AssetPairEntity from '../entities/AssetPair'
import OrderRepository from '../repositories/OrderRepository'
import RelayerService from '../services/RelayerService'
const ZeroEx = require('0x.js')

class LoadOrderbookTask {
  relayerService: RelayerService

  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(RelayerEntity).findOne({ name: 'Radar Relay' })

    if (!relayer) {
      return
    }

    const tokenPair: any = await getRepository(AssetPairEntity).findOne()

    const orderbook = await this.relayerService.loadOrderbook(relayer as IHttpRelayer, {
      baseAssetAddress: tokenPair.tokenAAddress,
      quoteAssetAddress: tokenPair.tokenBAddress
    })

    const orders = orderbook.bids.records.concat(orderbook.asks.records)

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
