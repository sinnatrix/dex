import * as express from 'express'
import Relayer from '../entities/Relayer'
import Token from '../entities/Token'
import OrderRepository from '../repositories/OrderRepository'
import config from '../config'
import { MoreThan } from 'typeorm'

class V1OwnController {
  application: any
  tokenRepository: any
  relayerRepository: any
  orderRepository: any

  constructor ({ connection, application }) {
    this.application = application

    this.tokenRepository = connection.getRepository(Token)
    this.relayerRepository = connection.getRepository(Relayer)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
  }

  attach () {
    const router = express.Router()

    router.get('/relayers', this.getRelayers.bind(this))
    router.get('/tokens', this.getTokens.bind(this))
    router.get('/tokens/:symbol', this.getTokenBySymbol.bind(this))
    router.get('/accounts/:address/orders', this.getActiveAccountOrders.bind(this))
    router.post('/orders/:hash/validate', this.validateOrder.bind(this))
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
        expirationTimeSeconds: MoreThan(currentUnixtime)
      },
      order: {
        expirationTimeSeconds: "ASC",
        id: "DESC"
      }
    })

    res.json(accountOrders)
  }
}

export default V1OwnController
