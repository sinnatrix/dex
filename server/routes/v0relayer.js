const log = require('../utils/log')
const router = require('express').Router()
const {BigNumber} = require('@0xproject/utils')
const {ZeroEx} = require('0x.js')
const Order = require('../models/Order')

const orders = []

router.get('/orderbook', async (req, res) => {
  log.info('HTTP: GET orderbook')

  const items = await Order.find({})
  log.info({items})

  const baseTokenAddress = req.query['baseTokenAddress']
  const quoteTokenAddress = req.query['quoteTokenAddress']

  res.status(201).send(renderOrderBook(baseTokenAddress, quoteTokenAddress))
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

  res.status(201).send({})
})

router.post('/fees', (req, res) => {
  log.info('HTTP: POST fees')

  const makerFee = new BigNumber(0).toString()
  const takerFee = ZeroEx.toBaseUnitAmount(new BigNumber(10), 18).toString()

  res.status(201).send({
    feeRecipient: ZeroEx.NULL_ADDRESS,
    makerFee,
    takerFee
  })
})

module.exports = router

function renderOrderBook (baseTokenAddress, quoteTokenAddress) {
  const bids = orders.filter(order => {
    return (order.takerTokenAddress === baseTokenAddress) &&
             (order.makerTokenAddress === quoteTokenAddress)
  })

  const asks = orders.filter(order => {
    return (order.takerTokenAddress === quoteTokenAddress) &&
             (order.makerTokenAddress === baseTokenAddress)
  })

  return {
    bids,
    asks
  }
}
