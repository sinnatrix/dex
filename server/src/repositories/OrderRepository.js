const { EntityRepository, Repository } = require('typeorm')
const Order = require('../entity/Order')

@EntityRepository(Order)
class OrderRepository extends Repository {
  async generateOrderbook ({ baseTokenAddress, quoteTokenAddress }) {
    const currentTs = (Date.now() / 1000).toFixed(0)

    const bids = await this.createQueryBuilder()
      .where('"takerTokenAddress" = :baseTokenAddress', { baseTokenAddress })
      .andWhere('"makerTokenAddress" = :quoteTokenAddress', { quoteTokenAddress })
      .andWhere('"expirationUnixTimestampSec" >= :currentTs', { currentTs })
      .getMany()

    const asks = await this.createQueryBuilder()
      .where('"takerTokenAddress" = :quoteTokenAddress', { quoteTokenAddress })
      .andWhere('"makerTokenAddress" = :baseTokenAddress', { baseTokenAddress })
      .andWhere('"expirationUnixTimestampSec" >= :currentTs', { currentTs })
      .getMany()

    return { bids, asks }
  }
}

module.exports = OrderRepository
