// const log = require('../utils/log')
const runner = require('../utils/runner')
const Relayer = require('../models/Relayer')
const TokenPair = require('../models/TokenPair')
const Order = require('../models/Order')
const { ObjectID } = require('mongodb')
const { ZeroEx } = require('0x.js')

runner(async () => {
  const relayer = await Relayer.findOne({ name: 'Radar Relay' })

  const tokenPair = await TokenPair.findOne({
    _id: ObjectID('5b128d6fca5a8b2300be99fb')
  })

  const orderbook = await relayer.loadOrderbook({
    baseTokenAddress: tokenPair.tokenAAddress,
    quoteTokenAddress: tokenPair.tokenBAddress
  })

  const orders = orderbook.bids.concat(orderbook.asks)

  for (let order of orders) {
    const orderHash = ZeroEx.getOrderHashHex(order)
    order = {
      ...order,
      orderHash
    }
    const model = new Order({ data: order })
    try {
      await model.save()
    } catch (e) {
      console.log('e: ', e)
    }
  }
})
