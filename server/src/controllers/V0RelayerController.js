const log = require('../utils/log')
const R = require('ramda')
const Router = require('express').Router
const { BigNumber } = require('@0x/utils')
const { ZeroEx } = require('0x.js')
const OrderRepository = require('../repositories/OrderRepository')
const Token = require('../entities/Token')
const TokenPair = require('../entities/TokenPair')
const config = require('../config')

class V0RelayerController {
  constructor ({ application, connection, wsOwnServer, wsRelayerServer }) {
    this.application = application
    this.wsOwnServer = wsOwnServer
    this.wsRelayerServer = wsRelayerServer

    this.tokenRepository = connection.getRepository(Token)
    this.tokenPairRepository = connection.getRepository(TokenPair)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
  }

  attach () {
    const router = Router()

    router.get('/token_pairs', this.getTokenPairs.bind(this))
    router.get('/orderbook', this.getOrderbook.bind(this))
    router.get('/orders', this.getOrders.bind(this))
    router.get('/orders/:orderHash', this.getOrderByHash.bind(this))
    router.post('/order', this.createOrder.bind(this))
    router.post('/fees', this.checkFees.bind(this))

    this.application.use(config.RELAYER_API_PATH, router)
  }

  async getTokenPairs (req, res) {
    const tokenPairs = await this.tokenPairRepository.find()

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
      const tokenA = await this.tokenRepository.findOne({ address: one.tokenAAddress })
      const tokenB = await this.tokenRepository.findOne({ address: one.tokenBAddress })

      result.push({
        tokenA: toSRAObject(tokenA),
        tokenB: toSRAObject(tokenB)
      })
    }

    res.send(result)
  }

  async getOrderbook (req, res) {
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

    const orderbook = await this.orderRepository.generateOrderbook({ baseTokenAddress, quoteTokenAddress })

    res.send(orderbook)
  }

  async getOrders (req, res) {
    const orders = await this.orderRepository.find({
      order: {
        expirationUnixTimestampSec: 'DESC'
      }
    })

    res.send(orders)
  }

  async getOrderByHash (req, res) {
    const { orderHash } = req.params
    const order = await this.orderRepository.findOne({ orderHash })
    if (!order) {
      res.status(404).send('not found')
      return
    }

    res.send(order)
  }

  async createOrder (req, res) {
    const order = req.body
    log.info({ order }, 'HTTP: POST order')

    await this.orderRepository.save(order)

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
  }

  async checkFees (req, res) {
    log.info('HTTP: POST fees')

    const makerFee = new BigNumber(0).toString()
    const takerFee = ZeroEx.toBaseUnitAmount(new BigNumber(10), 18).toString()

    res.send({
      feeRecipient: ZeroEx.NULL_ADDRESS,
      makerFee,
      takerFee
    })
  }
}

module.exports = V0RelayerController
