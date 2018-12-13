import {
  Repository,
  EntityRepository,
  Not,
  LessThan,
  MoreThan
} from 'typeorm'
import OrderEntity from '../entities/Order'
import { convertDexOrderToSRA2Format } from '../utils/helpers'
import { OrderStatus } from '@0x/contract-wrappers'
import { IOrderbook } from '../types'

@EntityRepository(OrderEntity)
export default class OrderRepository extends Repository<OrderEntity> {
  async getOrderbook ({
    baseAssetData,
    quoteAssetData,
    page = 1,
    perPage: take = 100
  }): Promise<IOrderbook> {
    // TODO validate page / perPage parameters
    const currentTs = (Date.now() / 1000).toFixed(0)
    const skip = take * (page - 1)

    const [ bids, bidsCount ] = await this.findAndCount({
      where: {
        takerAssetData: baseAssetData,
        makerAssetData: quoteAssetData,
        expirationTimeSeconds: Not(LessThan(currentTs)),
        orderStatus: OrderStatus.FILLABLE
      },
      skip,
      take
    } as any)

    const [ asks, asksCount ] = await this.findAndCount({
      where: {
        takerAssetData: quoteAssetData,
        makerAssetData: baseAssetData,
        expirationTimeSeconds: Not(LessThan(currentTs)),
        orderStatus: OrderStatus.FILLABLE
      },
      skip,
      take
    } as any)

    // TODO sort

    const formattedBids = bids.map(convertDexOrderToSRA2Format)
    const formattedAsks = asks.map(convertDexOrderToSRA2Format)

    return {
      bids: {
        total: bidsCount,
        page,
        perPage: take,
        records: formattedBids
      },
      asks: {
        total: asksCount,
        page,
        perPage: take,
        records: formattedAsks
      }
    }
  }

  async getActiveAccountOrders (address: string): Promise<OrderEntity[]> {
    const currentUnixtime = Math.trunc((new Date().getTime()) / 1000)

    return this.find({
      where: {
        makerAddress: address,
        expirationTimeSeconds: MoreThan(currentUnixtime),
        orderStatus: OrderStatus.FILLABLE
      },
      order: {
        expirationTimeSeconds: 'ASC'
      }
    })
  }

  async insertIgnore (entities: OrderEntity[]) {
    for (let entity of entities) {
      const order = await this.findOne(entity.orderHash)
      if (!order) {
        await this.save(entity)
      }
    }
  }
}
