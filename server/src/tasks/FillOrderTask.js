const { getCustomRepository } = require('typeorm')
const log = require('../utils/log')
const OrderRepository = require('../repositories/OrderRepository')

class FillOrderTask {
  constructor ({ orderBlockchainService }) {
    this.orderBlockchainService = orderBlockchainService
  }

  async run () {
    log.info('filling order...')

    const repository = getCustomRepository(OrderRepository)

    const order = await repository.findOne({
      orderHash: '0xc1123c89af3980a497a461422ec280610ced7eebec00f00a002cc5ab27a325b7'
    })

    this.orderBlockchainService.fillInBlockchain(order)
  }
}

module.exports = FillOrderTask
