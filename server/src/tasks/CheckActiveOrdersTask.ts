import { orderHashUtils } from '0x.js'
import JobEntity from '../entities/Job'
import OrderRepository from '../repositories/OrderRepository'
import OrderBlockchainService from '../services/OrderBlockchainService'
import OrderService from '../services/OrderService'
import { ITask } from '../types'
import { convertDexOrderToSRA2Format } from '../utils/helpers'
import { OrderStatus } from '@0x/contract-wrappers'
import log from '../utils/log'

class CheckActiveOrdersTask implements ITask {
  CHUNK_SIZE = 100

  orderService: OrderService
  orderRepository: OrderRepository
  orderBlockchainService: OrderBlockchainService

  constructor ({ orderRepository, orderBlockchainService, orderService }) {
    this.orderService = orderService
    this.orderRepository = orderRepository
    this.orderBlockchainService = orderBlockchainService
  }

  async run (job: JobEntity): Promise<JobEntity> {
    log.info(`CheckActiveOrdersTask: started`)
    const ordersQuery = this.orderRepository.createQueryBuilder()
      .where(
        `"orderStatus" IN (:...orderStatuses)`,
        { orderStatuses: [ OrderStatus.FILLABLE, OrderStatus.CANCELLED ] }
      )
    const count = await ordersQuery.getCount()
    log.info(`CheckActiveOrdersTask: ${count} order${count > 1 ? 's' : ''} to check`)

    ordersQuery.take(this.CHUNK_SIZE)

    const pages = Math.ceil(count / this.CHUNK_SIZE)
    for (let page = 1; page <= pages; page++) {
      log.info(`CheckActiveOrdersTask: page ${page} of ${pages}`)

      const skip = this.CHUNK_SIZE * (page - 1)
      ordersQuery.skip(skip)

      const dexOrders = await ordersQuery.getMany()
      const signedOrders = dexOrders.map(one => convertDexOrderToSRA2Format(one).order)

      let ordersInfo = await this.orderBlockchainService.getOrdersInfoAsync(signedOrders)
      ordersInfo = ordersInfo.map((one, index) => ({
        ...one,
        orderHash: orderHashUtils.getOrderHashHex(signedOrders[index])
      }))

      await this.orderService.saveOrdersInfo(ordersInfo)
    }

    return job
  }
}

export default CheckActiveOrdersTask
