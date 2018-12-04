import OrderRepository from '../repositories/OrderRepository'
import OrderBlockchainService from './OrderBlockchainService'
import { convertDexOrderToSRA2Format } from '../utils/helpers'
import log from '../utils/log'

export default class OrderService {
  orderRepository: OrderRepository
  orderBlockchainService: OrderBlockchainService

  constructor ({ connection, orderBlockchainService }) {
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.orderBlockchainService = orderBlockchainService
  }

  async updateOrdersInfo () {
    const orders = await this.orderRepository.find()
    log.info(`Updating info for ${orders.length} orders`)

    for (let order of orders) {
      await this.updateOrderInfoByHash(order.orderHash)
    }
  }

  async updateOrderInfoByHash (orderHash: string) {
    const order = await this.orderRepository.findOne({
      where: { orderHash }
    })

    const { order: signedOrder } = convertDexOrderToSRA2Format(order)

    const orderInfo = await this.orderBlockchainService.getOrderInfoAsync(signedOrder)

    const orderForSave = {
      ...order,
      ...orderInfo,
      orderTakerAssetFilledAmount: orderInfo.orderTakerAssetFilledAmount.toString(10)
    }

    await this.orderRepository.save(orderForSave)
  }
}
