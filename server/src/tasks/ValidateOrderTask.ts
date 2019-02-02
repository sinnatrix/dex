import { getCustomRepository } from 'typeorm'
import log from '../utils/log'
import { convertSignedOrderWithStringsToSignedOrder } from '../utils/helpers'
import OrderRepository from '../repositories/OrderRepository'
import OrderBlockchainService from '../services/OrderBlockchainService'

class ValidateOrderTask {
  orderBlockchainService: OrderBlockchainService

  constructor ({ orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
  }

  async run () {
    log.info('validating order...')

    const orderRepository = getCustomRepository(OrderRepository)

    const order = await orderRepository.findOne({
      orderHash: '0xc1123c89af3980a497a461422ec280610ced7eebec00f00a002cc5ab27a325b7'
    })

    if (!order) {
      throw new Error('Order not found')
    }

    await this.orderBlockchainService.validateInBlockchain(
      convertSignedOrderWithStringsToSignedOrder(order)
    )
  }
}

export default ValidateOrderTask
