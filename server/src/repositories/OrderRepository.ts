import { EntityRepository, Repository, Not, LessThan } from 'typeorm'
import Order from '../entities/Order'

@EntityRepository(Order as any)
class OrderRepository extends Repository<any> {
  async generateOrderbook ({ baseTokenAddress, quoteTokenAddress }) {
    const currentTs = (Date.now() / 1000).toFixed(0)

    const bids = await this.find({
      takerTokenAddress: baseTokenAddress,
      makerTokenAddress: quoteTokenAddress,
      expirationUnixTimestampSec: Not(LessThan(currentTs))
    } as any)

    const asks = await this.find({
      takerTokenAddress: quoteTokenAddress,
      makerTokenAddress: baseTokenAddress,
      expirationUnixTimestampSec: Not(LessThan(currentTs))
    } as any)

    return { bids, asks }
  }
}

export default OrderRepository
