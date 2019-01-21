import * as R from 'ramda'
import * as express from 'express'
import { BigNumber } from '@0x/utils'
import { Web3Wrapper } from '@0x/web3-wrapper'
import log from '../utils/log'
import config from '../config'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import {
  convertSignedOrderWithStringsToSignedOrder,
  convertOrderToDexFormat,
  convertDexOrderToSRA2Format,
  getDefaultOrderMetaData,
  toInt10
} from '../utils/helpers'
import { validateRequiredField, validateNetworkId } from '../validation'
import OrderBlockchainService from '../services/OrderBlockchainService'
import AssetPairRepository from '../repositories/AssetPairRepository'
import OrderRepository from '../repositories/OrderRepository'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

class V2RelayerController {
  application: any
  wsRelayerServer: WsRelayerServer
  assetPairRepository: AssetPairRepository
  orderRepository: OrderRepository
  orderBlockchainService: OrderBlockchainService
  networkId: number

  constructor ({
    application,
    wsRelayerServer,
    networkId,
    orderRepository,
    assetPairRepository,
    orderBlockchainService
  }) {
    this.application = application
    this.wsRelayerServer = wsRelayerServer
    this.networkId = networkId

    this.assetPairRepository = assetPairRepository
    this.orderRepository = orderRepository

    this.orderBlockchainService = orderBlockchainService
  }

  attach () {
    const router = express.Router()

    router.get('/asset_pairs', this.getAssetPairs.bind(this))
    router.get('/orderbook', this.getOrderbook.bind(this))
    router.get('/orders', this.getOrders.bind(this))
    router.get('/orders/:orderHash', this.getOrderByHash.bind(this))
    router.post('/order', this.createOrder.bind(this))
    router.post('/fees', this.checkFees.bind(this))

    this.application.use(config.RELAYER_API_V2_PATH, router)
  }

  async getAssetPairs (req, res) {
    const params = R.evolve(
      {
        page: toInt10,
        perPage: toInt10
      },
      R.pick(
        [
          'assetDataA',
          'assetDataB',
          'page',
          'perPage'
        ],
        req.query
      )
    )

    const result = await this.assetPairRepository.getAssetPairsWithAssetsAndCount(params)

    res.send(result)
  }

  /**
   * Corresponds to the Relayer 2.0.0 REST API specification
   *
   * @param req
   * @param res
   */
  async getOrderbook (req, res) {
    log.info('HTTP: GET /orderbook')

    const params = R.evolve(
      {
        networkId: toInt10,
        page: toInt10,
        perPage: toInt10
      },
      R.pick(
        [
          'baseAssetData',
          'quoteAssetData',
          'networkId',
          'page',
          'perPage'
        ],
        req.query
      )
    )

    // TODO use limiter, controller level, middleware
    res.set({
      'X-RateLimit-Limit': 0,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': 0,
      'Content-Type': 'application/json'
    })

    const validationErrors = [
      validateRequiredField('baseAssetData', params.baseAssetData),
      validateRequiredField('quoteAssetData', params.quoteAssetData),
      validateNetworkId(params.networkId, this.networkId)
    ].filter(one => !!one)

    if (validationErrors.length > 0) {
      res.status(400)
      res.send(JSON.stringify({
        code: 101,
        reason: 'Validation failed',
        validationErrors
      }))

      return null
    }

    const orderbook = await this.orderRepository.getOrderbook(params)

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
    log.info(req.body, 'HTTP: POST order')

    const order = convertSignedOrderWithStringsToSignedOrder(req.body)
    const metaData = getDefaultOrderMetaData(order)

    const sra2Order = {
      order,
      metaData
    }

    const orderToSave = convertOrderToDexFormat(sra2Order)

    await this.orderRepository.save(orderToSave)

    res.status(201).end()

    this.wsRelayerServer.pushUpdate(
      'orders',
      [convertDexOrderToSRA2Format(orderToSave)],
      [orderToSave]
    )
  }

  async checkFees (req, res) {
    log.info('HTTP: POST fees')

    const makerFee = new BigNumber(0).toString()
    const takerFee = Web3Wrapper.toBaseUnitAmount(new BigNumber(10), 18).toString()

    res.send({
      feeRecipient: NULL_ADDRESS,
      makerFee,
      takerFee
    })
  }
}

export default V2RelayerController
