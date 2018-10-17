const Router = require('express').Router
const Relayer = require('../entity/Relayer')
const Token = require('../entity/Token')
const OrderRepository = require('../repositories/OrderRepository')
const config = require('../config')

class V1OwnController {
  constructor ({ connection, application }) {
    this.connection = connection
    this.application = application
  }

  attach () {
    const router = this.create()

    this.application.use(config.OWN_API_PATH, router)
  }

  create () {
    const tokenRepository = this.connection.getRepository(Token)
    const relayerRepository = this.connection.getRepository(Relayer)
    const orderRepository = this.connection.getCustomRepository(OrderRepository)

    const router = Router()

    router.get('/relayers', async (req, res) => {
      const relayers = await relayerRepository.find()
      res.json(relayers)
    })

    router.get('/tokens', async (req, res) => {
      const tokens = await tokenRepository.find()
      res.json(tokens)
    })

    router.get('/tokens/:symbol', async (req, res) => {
      const { symbol } = req.params

      const token = await tokenRepository.findOne({ symbol })
      if (!token) {
        res.status(404).send('not found')
        return
      }

      res.json(token)
    })

    router.post('/orders/:hash/validate', async (req, res) => {
      const { hash } = req.params
      const order = await orderRepository.findOne({ orderHash: hash })

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
    })

    router.post('/orders', async (req, res) => {
      const data = req.body
      let order = await orderRepository.findOne({ orderHash: data.hash })
      if (order) {
        throw new Error('order already exists')
      }

      order = await orderRepository.save(data)

      res.send(order)
    })

    return router
  }
}

module.exports = V1OwnController
