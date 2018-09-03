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

router.get('/tokens/:symbol', async (req, res) => {
  const { symbol } = req.params

  const token = await Token.findOne({ symbol })
  if (!token) {
    res.status(404).send('not found')
    return
  }

  res.json(token)
})

router.post('/orders/:hash/validate', async (req, res) => {
  const { hash } = req.params
  const order = await Order.findOne({ 'data.orderHash': hash })

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

router.post('/orders', async (req, res) => {
  const { data } = req.body
  let order = await Order.findOne({ 'data.orderHash': data.hash })
  if (order) {
    throw new Error('order already exists')
  }

  order = new Order({ data })
  await order.save()

  res.send(order)
})

module.exports = router
