import {
  Repository,
  EntityRepository,
  Not,
  LessThan,
  MoreThan, Brackets
} from 'typeorm'
import OrderEntity from '../entities/Order'
import { convertDexOrderToSRA2Format } from '../utils/helpers'
import { OrderStatus } from '@0x/contract-wrappers'
import { OrdersResponse, PagedRequestOpts } from '@0x/types'
import { IOrderbook, OrdersRequestOptsExtended } from '../types'

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
        makerAssetData: baseAssetData,
        takerAssetData: quoteAssetData,
        expirationTimeSeconds: Not(LessThan(currentTs)),
        orderStatus: OrderStatus.FILLABLE
      },
      skip,
      take
    } as any)

    const [ asks, asksCount ] = await this.findAndCount({
      where: {
        takerAssetData: baseAssetData,
        makerAssetData: quoteAssetData,
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
      const order = await this.findOne({ orderHash: entity.orderHash })
      if (!order) {
        await this.insert(entity)
      }
    }
  }

  async getOrders (params: OrdersRequestOptsExtended & PagedRequestOpts): Promise<OrdersResponse> {
    const {
      page = 1,
      perPage = 100,
      traderAddress,
      traderAssetData,
      ...where
    } = params
    const skip = perPage * (page - 1)

    const query = this.createQueryBuilder('orders')
      .skip(skip)
      .take(perPage)
      .where('"orderStatus" = :orderStatus', { orderStatus: OrderStatus.FILLABLE })

    if (traderAddress) {
      query
        .andWhere(new Brackets(qb => {
          qb.where('"makerAddress" = :traderAddress')
            .orWhere('"takerAddress" = :traderAddress')
        }))
        .setParameters({ traderAddress })
    }

    if (traderAssetData) {
      query
        .andWhere(new Brackets(qb => {
          qb.where('"makerAssetData" = :traderAssetData')
            .orWhere('"takerAssetData" = :traderAssetData')
        }))
        .setParameters({ traderAssetData })
    }

    if (where.makerAssetData && where.takerAssetData) {
      query
        .addSelect('("takerAssetAmount"/"makerAssetAmount") as sort')
        .orderBy('sort', 'ASC')
    }

    for (let property of Object.keys(where)) {
      query.andWhere(`"${property}" = :${property}`, { [property]: where[property] })
    }

    const [ entities, total ] = await query.getManyAndCount()

    const records = entities.map(one => convertDexOrderToSRA2Format(one))

    return {
      total,
      records,
      page,
      perPage
    }
  }
}
