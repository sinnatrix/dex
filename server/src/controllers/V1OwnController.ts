import * as express from 'express'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import config from '../config'
import { convertDexOrderToSRA2Format, convertSignedOrderWithStringsToSignedOrder } from '../utils/helpers'
import { ISRA2Order } from '../types'
import MarketService from '../services/MarketService'
import { In } from 'typeorm'
import AssetPairRepository from '../repositories/AssetPairRepository'
import AssetRepository from '../repositories/AssetRepository'
import RelayerRepository from '../repositories/RelayerRepository'
import OrderRepository from '../repositories/OrderRepository'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import OrderBlockchainService from '../services/OrderBlockchainService'

class V1OwnController {
  application: any
  assetRepository: AssetRepository
  assetPairRepository: AssetPairRepository
  relayerRepository: RelayerRepository
  orderRepository: OrderRepository
  tradeHistoryRepository: TradeHistoryRepository
  orderBlockchainService: OrderBlockchainService
  wsRelayerServer: WsRelayerServer
  marketService: MarketService

  constructor ({
    application,
    assetRepository,
    assetPairRepository,
    relayerRepository,
    orderRepository,
    tradeHistoryRepository,
    orderBlockchainService,
    wsRelayerServer,
    marketService
  }) {
    this.application = application

    this.assetRepository = assetRepository
    this.assetPairRepository = assetPairRepository
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
    router.get('/markets', this.getTopMarkets.bind(this))
    router.get('/market/:marketId', this.getMarket.bind(this))
    router.get('/market/:marketId/candles', this.getMarketCandles.bind(this))

    this.application.use(config.OWN_API_PATH, router)
  }

  async getRelayers (req, res) {
    const relayers = await this.relayerRepository.find()
    res.json(relayers)
  }

  async getTokens (req, res) {
    const { symbols: symbolsString } = req.query
    let tokens
    if (symbolsString) {
      const symbols = symbolsString.split(',')
      tokens = await this.assetRepository.find({
        where: {
          symbol: In(symbols)
        }
      })
    } else {
      tokens = await this.assetRepository.find()
    }

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

    if (!order) {
      throw new Error('Order not found')
    }

    try {
      await this.orderBlockchainService.validateInBlockchain(
        convertSignedOrderWithStringsToSignedOrder(order)
      )

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

  async getTopMarkets (req, res) {
    const markets = await this.marketService.getTopMarkets()

    res.send(markets)
  }

  async getMarket (req, res) {
    const { marketId: assetPairSymbols } = req.params
    const assetPair = await this.assetPairRepository.getByAssetPairSymbolsString(assetPairSymbols)

    if (!assetPair) {
      throw new Error('Market not found')
    }
    const market = await this.marketService.getMarketByAssetPair(assetPair)

    res.send(market)
  }

  async getMarketCandles (req, res) {
    const { marketId: assetPairSymbols } = req.params
    const { fromTimestamp, toTimestamp, groupIntervalSeconds } = req.query

    const assetPair = await this.assetPairRepository.getByAssetPairSymbolsString(assetPairSymbols)

    if (!assetPair) {
      throw new Error('Market not found')
    }

    const market = await this.marketService.getMarketByAssetPair(assetPair)

    const candles = await this.marketService.getMarketCandles(
      market,
      +fromTimestamp,
      +toTimestamp,
      +groupIntervalSeconds
    )

    res.send(candles)
  }
}

export default V1OwnController
