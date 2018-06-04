const runner = require('../utils/runner')
const log = require('../utils/log')
const Order = require('../models/Order')

runner(async () => {
  log.info('filling order...')

  const order = await Order.findOne({
    orderHash: '0xc1123c89af3980a497a461422ec280610ced7eebec00f00a002cc5ab27a325b7'
  })

  await order.fillInBlockchain()
})
