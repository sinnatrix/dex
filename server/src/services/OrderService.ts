import OrderRepository from '../repositories/OrderRepository'
import OrderBlockchainService from './OrderBlockchainService'
import { convertOrderToSRA2Format } from '../utils/helpers'
import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'

export default class OrderService {
  orderRepository: OrderRepository
  orderBlockchainService: OrderBlockchainService
  wsRelayerServer: WsRelayerServer

  constructor ({ connection, orderBlockchainService, wsRelayerServer }) {
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.orderBlockchainService = orderBlockchainService
    this.wsRelayerServer = wsRelayerServer
  }

  async updateOrderInfoByHash (orderHash: string) {
    const order = await this.orderRepository.findOne({
      where: { orderHash }
    })

    const { order: signedOrder } = convertOrderToSRA2Format(order)

    const orderInfo = await this.orderBlockchainService.getOrderInfoAsync(signedOrder)

    const orderForSave = {
      ...order,
      ...orderInfo
    }

    await this.orderRepository.save(orderForSave)

    this.wsRelayerServer.pushUpdate(
      'orders',
      [convertOrderToSRA2Format(orderForSave)],
      [orderForSave]
    )

    return orderForSave
  }
}
