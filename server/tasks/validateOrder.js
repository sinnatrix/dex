const runner = require('../utils/runner')
const log = require('../utils/log')
const Order = require('../models/Order')

runner(async () => {
  log.info('validating order...')

  const order = await Order.findOne({})

  await order.validateInBlockchain()
})
