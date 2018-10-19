const log = require('../utils/log')
const runner = require('../utils/runner')
const Relayer = require('../models/Relayer')
const Order = require('../models/Order')

runner(async () => {
  const relayer = await Relayer.findOne({ name: 'Radar Relay' })

  const orders = await relayer.loadOrders()

  log.info({ count: orders.length }, 'loaded')

  for (let order of orders) {
    const model = new Order({ data: order })
    try {
      await model.save()
      log.info({ order }, 'saved')
    } catch (e) {
      log.info(e)
    }
  }

  log.info('saved')
})
