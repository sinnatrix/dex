import * as express from 'express'
import { BigNumber } from '@0x/utils'
import Relayer from '../entities/Relayer'
import Token from '../entities/Token'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import OrderRepository from '../repositories/OrderRepository'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import config from '../config'
import { convertOrderToSRA2Format } from '../utils/helpers'
import { ISRA2Order } from '../types'
import { Equal, MoreThan, Not } from 'typeorm'

class V1OwnController {
  application: any
  tokenRepository: any
  relayerRepository: any
  orderRepository: any
  tradeHistoryRepository: any
  orderBlockchainService: any
  wsRelayerServer: WsRelayerServer

  constructor ({ connection, application, orderBlockchainService, wsRelayerServer }) {
    this.application = application

    this.tokenRepository = connection.getRepository(Token)
    this.relayerRepository = connection.getRepository(Relayer)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.tradeHistoryRepository = connection.getCustomRepository(TradeHistoryRepository)
    this.orderBlockchainService = orderBlockchainService
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
    router.get('/tradeHistory', this.getTradeHistory.bind(this))
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

    const sra2Orders: ISRA2Order[] = accountOrders.map(convertOrderToSRA2Format)
    res.json(sra2Orders)
  }

  async getTradeHistory (req, res) {
    const {
      baseAssetData,
      quoteAssetData,
      page = 1,
      perPage: take = 50
    } = req.query

    const skip = take * (page - 1)
    const records = await this.tradeHistoryRepository.createQueryBuilder()
      .where('("makerAssetData" = :baseAssetData AND "takerAssetData" = :quoteAssetData)')
      .orWhere('("makerAssetData" = :quoteAssetData AND "takerAssetData" = :baseAssetData)')
      .setParameters({ baseAssetData: baseAssetData, quoteAssetData: quoteAssetData })
      .skip(skip)
      .take(take)
      .orderBy('"blockNumber"', 'DESC')
      .getMany()

    res.json(records)
  }

  async getAccountTradeHistory (req, res) {
    const { address } = req.params

    const accountTradeHistory = await this.tradeHistoryRepository.createQueryBuilder()
      .where('"makerAddress" = :address')
      .orWhere('"takerAddress" = :address')
      .setParameters({ address })
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

    this.wsRelayerServer.pushUpdate('orders', [convertOrderToSRA2Format(orderForSave)], [orderForSave])
  }
}

export default V1OwnController
