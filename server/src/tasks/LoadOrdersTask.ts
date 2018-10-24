import { getRepository, getCustomRepository } from 'typeorm'
import log from '../utils/log'
import Relayer from '../entities/Relayer'
import OrderRepository from '../repositories/OrderRepository'

class LoadOrdersTask {
  relayerService: any

  constructor ({ relayerService }) {
    this.relayerService = relayerService
  }

  async run () {
    const relayer = await getRepository(Relayer as any).findOne({ name: 'Radar Relay' })

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

export default LoadOrdersTask
