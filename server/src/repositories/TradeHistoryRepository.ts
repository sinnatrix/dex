import { EntityRepository, Repository } from 'typeorm'
import TradeHistory from '../entities/TradeHistory'

@EntityRepository(TradeHistory as any)
class TradeHistoryRepository extends Repository<any> {
  DEFAULT_BLOCK_NUMBER = 0

  async getLatestSynchronizedBlockNumber(address) {
    const result = await this.find({
      select: [ 'blockNumber' ],
      where: {
        makerAddress: address,
        takerAddress: address
      },
      order: {
        blockNumber: 'DESC'
      },
      take: 1
    })

    if (!result.length) {
      return this.DEFAULT_BLOCK_NUMBER
    }

    return result[0].blockNumber
  }

  async saveMultiple (recordsToSave) {
    return this.createQueryBuilder()
      .insert()
      .values(recordsToSave)
      .onConflict('("orderHash") DO NOTHING')
      .execute()
  }
}

export default TradeHistoryRepository
