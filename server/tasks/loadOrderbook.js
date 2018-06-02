const log = require('../utils/log')
const runner = require('../utils/runner')
const Relayer = require('../models/Relayer')
const TokenPair = require('../models/TokenPair')

runner(async () => {
  const relayer = await Relayer.findOne({name: 'Radar Relay'})

  const tokenPair = await TokenPair.findOne()

  const orderbook = await relayer.loadOrderbook({
    baseTokenAddress: tokenPair.tokenAAddress,
    quoteTokenAddress: tokenPair.tokenBAddress
  })

  log.info(orderbook)
})
