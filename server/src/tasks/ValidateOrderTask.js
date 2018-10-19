const { getCustomRepository } = require('typeorm')
const log = require('../utils/log')
const OrderRepository = require('../repositories/OrderRepository')

class ValidateOrderTask {
  constructor ({ orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
  }

  async run () {
    log.info('validating order...')

    const orderRepository = getCustomRepository(OrderRepository)

    const order = await orderRepository.findOne({
      orderHash: '0xc1123c89af3980a497a461422ec280610ced7eebec00f00a002cc5ab27a325b7'
    })

    await this.orderBlockchainService.validateInBlockchain(order)
  }
}

module.exports = ValidateOrderTask
