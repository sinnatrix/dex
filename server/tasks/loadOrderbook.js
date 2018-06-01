const log = require('../utils/log')
const Relayer = require('../models/Relayer')
const runner = require('../utils/runner')

runner(async () => {
  const relayer = await Relayer.findOne({name: 'Radar Relay'})

  const orderbook = await relayer.loadOrderbook()

  log.info(orderbook)
})
