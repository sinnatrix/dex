import OrderRepository from '../repositories/OrderRepository'
import RelayerRepository from '../repositories/RelayerRepository'
import RelayerService from '../services/RelayerService'
import { convertOrderToDexFormat, getDefaultOrderMetaData } from '../utils/helpers'

export default class LoadOrdersTask {
  relayerRepository: RelayerRepository
  orderRepository: OrderRepository
  relayerService: RelayerService

  constructor ({ connection, relayerService }) {
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.relayerRepository = connection.getCustomRepository(RelayerRepository)
    this.relayerService = relayerService
  }

  async run () {
    const relayers = await this.relayerRepository.getAllActiveWithHttpEndpoint()

    for (let relayer of relayers) {
      await this.loadOrdersAndSave(relayer)
    }
  }

  async loadOrdersAndSave (relayer) {
    const orders = await this.relayerService.loadOrders(relayer)

    if (orders.total > 0) {
      console.log(`Relayer ${relayer.name} has ${orders.total} orders`)

      const ordersToSave = orders.records.map(order => ({
        relayerId: relayer.id,
        ...convertOrderToDexFormat({
          ...order,
          metaData: getDefaultOrderMetaData(order.order)
        })
      }))

      await this.orderRepository.insertIgnore(ordersToSave)
    }
  }
}
