const router = require('express').Router()
const Relayer = require('../models/Relayer')
const Token = require('../models/Token')
const Order = require('../models/Order')

router.get('/relayers', async (req, res) => {
  const relayers = await Relayer.find()
  res.json(relayers)
})

router.get('/tokens', async (req, res) => {
  const tokens = await Token.find()
  res.json(tokens)
})

router.get('/token/:address', async (req, res) => {
  const {address} = req.params

  const token = await Token.findOne({address})
  if (!token) {
    res.status(404).send('not found')
    return
  }

  res.json(token)
})

router.get('/token/by-symbol/:symbol', async (req, res) => {
  const {symbol} = req.params

  const token = await Token.findOne({symbol})
  if (!token) {
    res.status(404).send('not found')
    return
  }

  res.json(token)
})

router.get('/orders/bids', async (req, res) => {
  const {baseTokenSymbol, quoteTokenSymbol} = req.query
  const bids = await Order.findBidsOwn({baseTokenSymbol, quoteTokenSymbol})
  res.json(bids)
})

router.get('/orders/asks', async (req, res) => {
  const {baseTokenSymbol, quoteTokenSymbol} = req.query
  const asks = await Order.findAsksOwn({baseTokenSymbol, quoteTokenSymbol})
  res.json(asks)
})

router.post('/orders/:hash/validate', async (req, res) => {
  const {hash} = req.params
  const order = await Order.findOne({orderHash: hash})

  try {
    await order.validateInBlockchain()
    res.send({
      error: ''
    })
  } catch (e) {
    console.error(e)
    res.send({
      error: e.message
    })
  }
})

module.exports = router
