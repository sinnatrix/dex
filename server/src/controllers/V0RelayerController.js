const log = require('../utils/log')
const R = require('ramda')
const Router = require('express').Router
const { BigNumber } = require('@0xproject/utils')
const { ZeroEx } = require('0x.js')
const OrderRepository = require('../repositories/OrderRepository')
const Token = require('../entity/Token')
const TokenPair = require('../entity/TokenPair')
const config = require('../config')

class V0RelayerController {
  constructor ({ application, connection, wsOwnServer, wsRelayerServer }) {
    this.application = application
    this.connection = connection
    this.wsOwnServer = wsOwnServer
    this.wsRelayerServer = wsRelayerServer
  }

  attach () {
    const router = this.create()
    this.application.use(config.RELAYER_API_PATH, router)
  }

  create () {
    const tokenRepository = this.connection.getRepository(Token)
    const tokenPairRepository = this.connection.getRepository(TokenPair)
    const orderRepository = this.connection.getCustomRepository(OrderRepository)

    const router = Router()

    router.get('/token_pairs', async (req, res) => {
      const tokenPairs = await tokenPairRepository.find()

      log.info({ tokenPairs })

      const result = []

      const toSRAObject = token => {
        return R.pick([
          'address',
          'minAmount',
          'maxAmount',
          'precision'
        ], token)
      }

      for (const one of tokenPairs) {
        const tokenA = await tokenRepository.findOne({ address: one.tokenAAddress })
        const tokenB = await tokenRepository.findOne({ address: one.tokenBAddress })

        result.push({
          tokenA: toSRAObject(tokenA),
          tokenB: toSRAObject(tokenB)
        })
      }

      res.send(result)
    })

    router.get('/orderbook', async (req, res) => {
      log.info('HTTP: GET orderbook')

      const { baseTokenAddress, quoteTokenAddress } = req.query
      if (!baseTokenAddress) {
        res.status(400).send('baseTokenAddress is a required param')
        return
      }

      if (!quoteTokenAddress) {
        res.status(400).send('quouteTokenAddress is a required param')
        return
      }

      const orderbook = await orderRepository.generateOrderbook({ baseTokenAddress, quoteTokenAddress })

      res.send(orderbook)
    })

    router.get('/orders', async (req, res) => {
      const orders = await orderRepository.find({
        order: {
          expirationUnixTimestampSec: 'DESC'
        }
      })

      res.send(orders)
    })

    router.get('/orders/:orderHash', async (req, res) => {
      const { orderHash } = req.params
      const order = await orderRepository.findOne({ orderHash })
      if (!order) {
        res.status(404).send('not found')
        return
      }
      res.send(order)
    })

    router.post('/order', async (req, res) => {
      const order = req.body
      log.info({ order }, 'HTTP: POST order')

      await orderRepository.save(order)

      res.status(201).end()

      this.wsRelayerServer.clients.forEach(client => {
        const msg = {
          type: 'update',
          channel: 'orderbook',
          requestId: 1,
          payload: order
        }

        client.send(JSON.stringify(msg))
      })

      this.wsOwnServer.clients.forEach(client => {
        const msg = {
          type: 'update',
          channel: 'orderbook',
          payload: order
        }

        client.send(JSON.stringify(msg))
      })
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

    return router
  }
}

module.exports = V0RelayerController
