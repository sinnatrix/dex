const router = require('express').Router()
const Relayer = require('../models/Relayer')
const Token = require('../models/Token')

router.get('/relayers', async (req, res) => {
  const relayers = await Relayer.find()
  res.json(relayers)
})

router.get('/tokens', async (req, res) => {
  const tokens = await Token.find()
  res.json(tokens)
})

module.exports = router
