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
