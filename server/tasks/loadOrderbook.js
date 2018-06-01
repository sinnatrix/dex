const log = require('../utils/log')
const Relayer = require('../models/Relayer')
const runner = require('../utils/runner')

runner(async () => {
  const relayer = await Relayer.findOne({name: 'Radar Relay'})

  const orderbook = await relayer.loadOrderbook({
    baseTokenAddress: '0xe41d2489571d322189246dafa5ebde1f4699f498',
    quoteTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  })

  log.info(orderbook)
})
