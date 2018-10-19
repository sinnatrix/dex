const { EntityRepository, Repository, Not, LessThan } = require('typeorm')
const Order = require('../entities/Order')

@EntityRepository(Order)
class OrderRepository extends Repository {
  async generateOrderbook ({ baseTokenAddress, quoteTokenAddress }) {
    const currentTs = (Date.now() / 1000).toFixed(0)

    const bids = await this.find({
      takerTokenAddress: baseTokenAddress,
      makerTokenAddress: quoteTokenAddress,
      expirationUnixTimestampSec: Not(LessThan(currentTs))
    })

    const asks = await this.find({
      takerTokenAddress: quoteTokenAddress,
      makerTokenAddress: baseTokenAddress,
      expirationUnixTimestampSec: Not(LessThan(currentTs))
    })

    return { bids, asks }
  }
}

module.exports = OrderRepository
