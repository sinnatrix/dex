// const log = require('../utils/log')
const { getRepository, getCustomRepository } = require('typeorm')
const Relayer = require('../entities/Relayer')
const TokenPair = require('../entities/TokenPair')
const OrderRepository = require('../repositories/OrderRepository')
const { ObjectID } = require('mongodb')
const { ZeroEx } = require('0x.js')

class LoadOrderbookTask {
  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(Relayer).findOne({ name: 'Radar Relay' })

    const tokenPair = await getRepository(TokenPair).findOne({
      _id: ObjectID('5b128d6fca5a8b2300be99fb')
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

module.exports = LoadOrderbookTask
