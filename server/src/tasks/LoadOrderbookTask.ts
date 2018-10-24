import { getRepository, getCustomRepository } from 'typeorm'
import Relayer from '../entities/Relayer'
import TokenPair from '../entities/TokenPair'
import OrderRepository from '../repositories/OrderRepository'
const ZeroEx = require('0x.js')

class LoadOrderbookTask {
  relayerService: any

  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(Relayer as any).findOne({ name: 'Radar Relay' })

    const tokenPair: any = await getRepository(TokenPair as any).findOne({
      id: '5b128d6fca5a8b2300be99fb'
    })

    const orderbook = await this.relayerService.loadOrderbook(relayer, {
      baseTokenAddress: tokenPair.tokenAAddress,
      quoteTokenAddress: tokenPair.tokenBAddress
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
