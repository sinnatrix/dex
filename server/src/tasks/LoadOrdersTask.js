const { getRepository, getCustomRepository } = require('typeorm')
const log = require('../utils/log')
const Relayer = require('../entities/Relayer')
const OrderRepository = require('../repositories/OrderRepository')

class LoadOrdersTask {
  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(Relayer).findOne({ name: 'Radar Relay' })

    const orders = await this.relayerService.loadOrders(relayer)

    log.info({ count: orders.length }, 'loaded')

    const orderRepository = getCustomRepository(OrderRepository)

    for (let order of orders) {
      try {
        await orderRepository.save(order)
        log.info({ order }, 'saved')
      } catch (e) {
        log.info(e)
      }
    }

    log.info('saved')
  }
}

module.exports = LoadOrdersTask
