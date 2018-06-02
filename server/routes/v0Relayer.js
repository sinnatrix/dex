const log = require('../utils/log')
const router = require('express').Router()
const {BigNumber} = require('@0xproject/utils')
const {ZeroEx} = require('0x.js')
const Order = require('../models/Order')
const Token = require('../models/Token')
const TokenPair = require('../models/TokenPair')

router.get('/token_pairs', async (req, res) => {
  const tokenPairs = await TokenPair.find({})

  log.info({tokenPairs})

  const result = []

  for (const one of tokenPairs) {
    const tokenA = await Token.findOne({address: one.tokenAAddress})
    const tokenB = await Token.findOne({address: one.tokenBAddress})

    result.push({
      tokenA: tokenA.toSRAObject(),
      tokenB: tokenB.toSRAObject()
    })
  }

  res.send(result)
})

router.get('/orderbook', async (req, res) => {
  log.info('HTTP: GET orderbook')

  const {baseTokenAddress, quoteTokenAddress} = req.query
  if (!baseTokenAddress) {
    res.status(500).send('baseTokenAddress is a required param')
    return
  }

  if (!quoteTokenAddress) {
    res.status(500).send('quouteTokenAddress is a required param')
    return
  }

  const orderbook = await Order.generateOrderbook({baseTokenAddress, quoteTokenAddress})

  res.send(orderbook)
})

router.get('/orders', async (req, res) => {
  const orders = await Order.find({})

  res.send(orders)
})

router.get('/orders/:orderHash', async (req, res) => {
  const {orderHash} = req.params
  const order = await Order.findOne({orderHash})
  if (!order) {
    res.status(404).send('not found')
    return
  }
  res.send(order)
})

router.post('/order', async (req, res) => {
  const order = req.body
  log.info({order}, 'HTTP: POST order')

  const model = new Order(order)
  await model.save()

  // if (socketConnection !== undefined) {
  //   const message = {
  //     type: 'update',
  //     channel: 'orderbook',
  //     requestId: 1,
  //     payload: order
  //   }
  //   socketConnection.send(JSON.stringify(message))
  // }

  res.status(201).end()
})

router.post('/fees', (req, res) => {
  log.info('HTTP: POST fees')

  const makerFee = new BigNumber(0).toString()
  const takerFee = ZeroEx.toBaseUnitAmount(new BigNumber(10), 18).toString()

  res.send({
    feeRecipient: ZeroEx.NULL_ADDRESS,
    makerFee,
    takerFee
  })
})

module.exports = router
