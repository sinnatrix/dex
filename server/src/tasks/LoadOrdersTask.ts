import OrderRepository from '../repositories/OrderRepository'
import RelayerRepository from '../repositories/RelayerRepository'
import RelayerService from '../services/RelayerService'
import { convertOrderToDexFormat, getDefaultOrderMetaData } from '../utils/helpers'
import log from '../utils/log'

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

  async loadOrdersAndSave (relayer, page: number = 1) {
    const orders = await this.relayerService.loadOrders(relayer, page)

    if (orders.total > 0) {
      const totalPages = Math.ceil(orders.total / orders.perPage)

      log.info(`Relayer '${relayer.name}' pages: ${page}/${totalPages}, orders: ${orders.total}`)

      const ordersToSave = orders.records.map(order => ({
        relayerId: relayer.id,
        ...convertOrderToDexFormat({
          ...order,
          metaData: getDefaultOrderMetaData(order.order)
        })
      }))

      await this.orderRepository.insertIgnore(ordersToSave)

      if (page < totalPages) {
        const nextPage = page + 1
        await this.loadOrdersAndSave(relayer, nextPage)
      }
    }
  }
}
