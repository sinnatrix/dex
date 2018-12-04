import {
  Repository,
  EntityRepository,
  Not,
  LessThan,
  Equal,
  MoreThan
} from 'typeorm'
import Order from '../entities/Order'
import { convertOrderToSRA2Format } from '../utils/helpers'
import { OrderStatus } from '@0x/contract-wrappers'

@EntityRepository(Order as any)
class OrderRepository extends Repository<any> {
  async getOrderbook ({
    baseAssetData,
    quoteAssetData,
    networkId = process.env.NETWORK_ID,
    page = 1,
    perPage: take = 100
  }) {
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

    const formattedBids = bids.map(convertOrderToSRA2Format)
    const formattedAsks = asks.map(convertOrderToSRA2Format)

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

  async getActiveAccountOrders (address) {
    const currentUnixtime = Math.trunc((new Date().getTime()) / 1000)

    return this.find({
      where: {
        makerAddress: address,
        expirationTimeSeconds: MoreThan(currentUnixtime),
        orderStatus: OrderStatus.FILLABLE
      },
      order: {
        expirationTimeSeconds: 'ASC',
        id: 'DESC'
      }
    })
  }
}

export default OrderRepository
