import OrderRepository from '../repositories/OrderRepository'
import RelayerRepository from '../repositories/RelayerRepository'
import RelayerService from '../services/RelayerService'
import JobEntity from '../entities/Job'
import { convertOrderToDexFormat, getDefaultOrderMetaData } from '../utils/helpers'
import log from '../utils/log'

export default class LoadOrdersTask {
  relayerRepository: RelayerRepository
  orderRepository: OrderRepository
  relayerService: RelayerService

  constructor ({ relayerRepository, orderRepository, relayerService }) {
    this.orderRepository = orderRepository
    this.relayerRepository = relayerRepository
    this.relayerService = relayerService
  }

  async run (job: JobEntity): Promise<JobEntity> {
    const relayers = await this.relayerRepository.getAllActiveWithHttpEndpoint()

    for (let relayer of relayers) {
      await this.loadOrdersAndSave(relayer)
    }

    return job
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
