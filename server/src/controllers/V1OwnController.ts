import * as express from 'express'
import { BigNumber } from '@0x/utils'
import Relayer from '../entities/Relayer'
import Token from '../entities/Token'
import OrderRepository from '../repositories/OrderRepository'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import config from '../config'
import { Equal, MoreThan, Not } from 'typeorm'

class V1OwnController {
  application: any
  tokenRepository: any
  relayerRepository: any
  orderRepository: any
  tradeHistoryRepository: any
  orderBlockchainService: any
  tradeHistoryService: any
  wsRelayerServer: any

  constructor ({
    connection,
    application,
    orderBlockchainService,
    tradeHistoryService,
    wsRelayerServer
  }) {
    this.application = application

    this.tokenRepository = connection.getRepository(Token)
    this.relayerRepository = connection.getRepository(Relayer)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.orderBlockchainService = orderBlockchainService
    this.tradeHistoryService = tradeHistoryService
    this.wsRelayerServer = wsRelayerServer
  }

  attach () {
    const router = express.Router()

    router.get('/relayers', this.getRelayers.bind(this))
    router.get('/tokens', this.getTokens.bind(this))
    router.get('/tokens/:symbol', this.getTokenBySymbol.bind(this))
    router.get('/orders/:hash/refresh', this.refreshOrder.bind(this))
    router.get('/accounts/:address/orders', this.getActiveAccountOrders.bind(this))
    router.get('/accounts/:address/history', this.getAccountTradeHistory.bind(this))
    router.post('/orders/:hash/validate', this.validateOrder.bind(this))
    router.get('/orders/:hash/history', this.loadOrderTradeHistory.bind(this))
    router.post('/orders', this.createOrder.bind(this))

    this.application.use(config.OWN_API_PATH, router)
  }

  async getRelayers (req, res) {
    const relayers = await this.relayerRepository.find()
    res.json(relayers)
  }

  async getTokens (req, res) {
    const tokens = await this.tokenRepository.find()
    res.json(tokens)
  }

  async getTokenBySymbol (req, res) {
    const { symbol } = req.params

    const token = await this.tokenRepository.findOne({ symbol })
    if (!token) {
      res.status(404).send('not found')
      return
    }

    res.json(token)
  }

  async validateOrder (req, res) {
    const { hash } = req.params
    const order = await this.orderRepository.findOne({ orderHash: hash })

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
  }

  async createOrder (req, res) {
    const data = req.body
    let order = await this.orderRepository.findOne({ orderHash: data.hash })
    if (order) {
      throw new Error('order already exists')
    }

    order = await this.orderRepository.save(data)

    res.send(order)
  }

  async getActiveAccountOrders (req, res) {
    const { address } = req.params
    const currentUnixtime = Math.trunc((new Date().getTime()) / 1000)

    const accountOrders = await this.orderRepository.find({
      where: {
        makerAddress: address,
        expirationTimeSeconds: MoreThan(currentUnixtime),
        remainingTakerAssetAmount: Not(Equal('0'))
      },
      order: {
        expirationTimeSeconds: 'ASC',
        id: 'DESC'
      }
    })

    res.json(accountOrders)
  }

  async getAccountTradeHistory (req, res) {
    const { address } = req.params

    const accountTradeHistory = await this.tradeHistoryRepository.createQueryBuilder()
      .where('"makerAddress" = :address', { address })
      .orWhere('"takerAddress" = :address', { address })
      .orderBy('"blockNumber"', 'DESC')
      .addOrderBy('"id"', 'DESC')
      .getMany()

    res.json(accountTradeHistory)
  }

  async loadOrderTradeHistory (req, res) {
    const { hash: orderHash } = req.params
    const tradeHistory = await this.orderBlockchainService.loadOrderHistory(orderHash)

    res.json(tradeHistory)
  }

  async refreshOrder (req, res) {
    const { hash: orderHash } = req.params

    const order = await this.orderRepository.findOne({ orderHash })

    if (!order) {
      res.status(404).send('Not found')
      return
    }

    const filledTakerAssetAmount = await this.orderBlockchainService.getFilledTakerAssetAmount(orderHash)
    const remainingTakerAssetAmount = (new BigNumber(order.takerAssetAmount))
      .minus(new BigNumber(filledTakerAssetAmount)).toString()

    if (order.remainingTakerAssetAmount === remainingTakerAssetAmount) {
      res.status(200).json(order)
      return
    }

    const orderForSave = {
      ...order,
      remainingTakerAssetAmount
    }

    await this.orderRepository.save(orderForSave)

    res.status(200).json(orderForSave)

    this.wsRelayerServer.pushOrder(orderForSave)
  }
}

export default V1OwnController
