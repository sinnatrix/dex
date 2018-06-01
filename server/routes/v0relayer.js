const log = require('../utils/log')
const router = require('express').Router()
const {BigNumber} = require('@0xproject/utils')
const {ZeroEx} = require('0x.js')

const orders = []

router.get('/orderbook', (req, res) => {
  log.info('HTTP: GET orderbook')

  const baseTokenAddress = req.param('baseTokenAddress')
  const quoteTokenAddress = req.param('quoteTokenAddress')

  res.status(201).send(renderOrderBook(baseTokenAddress, quoteTokenAddress))
})

router.post('/order', (req, res) => {
  log.info('HTTP: POST order')
  const order = req.body
  orders.push(order)

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
