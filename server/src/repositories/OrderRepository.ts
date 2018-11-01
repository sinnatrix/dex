import { EntityRepository, Repository, Not, LessThan } from 'typeorm'
import Order from '../entities/Order'

@EntityRepository(Order as any)
class OrderRepository extends Repository<any> {
  async generateOrderbook ({ baseAssetAddress, quoteAssetAddress }) {
    const currentTs = (Date.now() / 1000).toFixed(0)

    const bids = await this.find({
      takerAssetAddress: baseAssetAddress,
      makerAssetAddress: quoteAssetAddress,
      expirationTimeSeconds: Not(LessThan(currentTs))
    } as any)

    const asks = await this.find({
      takerAssetAddress: quoteAssetAddress,
      makerAssetAddress: baseAssetAddress,
      expirationTimeSeconds: Not(LessThan(currentTs))
    } as any)

    return { bids, asks }
  }
}

export default OrderRepository
