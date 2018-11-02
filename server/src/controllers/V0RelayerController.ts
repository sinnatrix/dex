import * as R from 'ramda'
import * as express from 'express'
import { BigNumber } from '@0x/utils'
import log from '../utils/log'
import OrderRepository from '../repositories/OrderRepository'
import Token from '../entities/Token'
import TokenPair from '../entities/TokenPair'
import config from '../config'
const ZeroEx = require('0x.js')

class V0RelayerController {
  application: any
  wsOwnServer: any
  wsRelayerServer: any
  tokenRepository: any
  tokenPairRepository: any
  orderRepository: any

  constructor ({ application, connection, wsOwnServer, wsRelayerServer }) {
    this.application = application
    this.wsOwnServer = wsOwnServer
    this.wsRelayerServer = wsRelayerServer

    this.tokenRepository = connection.getRepository(Token)
    this.tokenPairRepository = connection.getRepository(TokenPair)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
  }

  attach () {
    const router = express.Router()

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

    const result: any[] = []

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

    const { baseAssetAddress, quoteAssetAddress } = req.query
    if (!baseAssetAddress) {
      res.status(400).send('baseAssetAddress is a required param')
      return
    }

    if (!quoteAssetAddress) {
      res.status(400).send('quouteTokenAddress is a required param')
      return
    }

    const orderbook = await this.orderRepository.generateOrderbook({ baseAssetAddress, quoteAssetAddress })

    res.send(orderbook)
  }

  async getOrders (req, res) {
    const orders = await this.orderRepository.find({
      order: {
        expirationTimeSeconds: 'DESC'
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

export default V0RelayerController