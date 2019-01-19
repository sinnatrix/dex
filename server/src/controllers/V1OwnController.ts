import * as express from 'express'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import config from '../config'
import { convertDexOrderToSRA2Format } from '../utils/helpers'
import { ISRA2Order } from '../types'
import MarketService from '../services/MarketService'

class V1OwnController {
  application: any
  assetRepository: any
  relayerRepository: any
  orderRepository: any
  tradeHistoryRepository: any
  orderBlockchainService: any
  wsRelayerServer: WsRelayerServer
  marketService: MarketService

  constructor ({
    application,
    assetRepository,
    relayerRepository,
    orderRepository,
    tradeHistoryRepository,
    orderBlockchainService,
    wsRelayerServer,
    marketService
  }) {
    this.application = application

    this.assetRepository = assetRepository
    this.relayerRepository = relayerRepository
    this.orderRepository = orderRepository
    this.tradeHistoryRepository = tradeHistoryRepository
    this.orderBlockchainService = orderBlockchainService
    this.wsRelayerServer = wsRelayerServer
    this.marketService = marketService
  }

  attach () {
    const router = express.Router()

    router.get('/relayers', this.getRelayers.bind(this))
    router.get('/tokens', this.getTokens.bind(this))
    router.get('/tokens/:symbol', this.getTokenBySymbol.bind(this))
    router.get('/accounts/:address/orders', this.getActiveAccountOrders.bind(this))
    router.get('/accounts/:address/history', this.getAccountTradeHistory.bind(this))
    router.get('/tradeHistory', this.getTradeHistory.bind(this))
    router.post('/orders/:hash/validate', this.validateOrder.bind(this))
    router.get('/orders/:hash/history', this.loadOrderTradeHistory.bind(this))
    router.post('/orders', this.createOrder.bind(this))
    router.get('/markets', this.getMarkets.bind(this))
    router.get('/market/:marketId/candles', this.getMarketCandles.bind(this))

    this.application.use(config.OWN_API_PATH, router)
  }

  async getRelayers (req, res) {
    const relayers = await this.relayerRepository.find()
    res.json(relayers)
  }

  async getTokens (req, res) {
    const tokens = await this.assetRepository.find()
    res.json(tokens)
  }

  async getTokenBySymbol (req, res) {
    const { symbol } = req.params

    const token = await this.assetRepository.findOne({ symbol })
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

    const accountOrders = await this.orderRepository.getActiveAccountOrders(address)

    const sra2Orders: ISRA2Order[] = accountOrders.map(convertDexOrderToSRA2Format)
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
    const records = await this.tradeHistoryRepository.getAssetPairTradeHistoryAsync({
      baseAssetData,
      quoteAssetData,
      skip,
      take
    })

    res.json(records)
  }

  async getAccountTradeHistory (req, res) {
    const { address } = req.params
    const accountTradeHistory = await this.tradeHistoryRepository.getAccountTradeHistoryAsync(address)

    res.json(accountTradeHistory)
  }

  async loadOrderTradeHistory (req, res) {
    const { hash: orderHash } = req.params
    const tradeHistory = await this.orderBlockchainService.loadOrderHistory(orderHash)

    res.json(tradeHistory)
  }

  async getMarkets (req, res) {
    const markets = await this.marketService.getMarkets()
    res.send(markets)
  }

  async getMarketCandles (req, res) {
    const { marketId: assetPairSymbols } = req.params
    const { fromTimestamp, toTimestamp, groupIntervalSeconds } = req.query

    const market = await this.marketService.getMarketByAssetPairSymbols(assetPairSymbols)
    const candles = await this.marketService.getMarketCandles(
      market,
      +fromTimestamp,
      +toTimestamp,
      +groupIntervalSeconds
    )
    return res.send(candles)
  }
}

export default V1OwnController
