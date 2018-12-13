import { getCustomRepository } from 'typeorm'
import log from '../utils/log'
import OrderRepository from '../repositories/OrderRepository'

class ValidateOrderTask {
  orderBlockchainService: any

  constructor ({ orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
  }

  async run () {
    log.info('validating order...')

    const orderRepository = getCustomRepository(OrderRepository)

    const order = await orderRepository.findOne({
      orderHash: '0xc1123c89af3980a497a461422ec280610ced7eebec00f00a002cc5ab27a325b7'
    } as any)

    await this.orderBlockchainService.validateInBlockchain(order)
  }
}

export default ValidateOrderTask
