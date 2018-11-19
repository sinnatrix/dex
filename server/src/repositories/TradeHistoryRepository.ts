import { EntityRepository, Repository } from 'typeorm'
import TradeHistory from '../entities/TradeHistory'

@EntityRepository(TradeHistory as any)
class TradeHistoryRepository extends Repository<any> {
  DEFAULT_BLOCK_NUMBER = 0

  async saveFullTradeHistory (recordsToSave) {
    return this.createQueryBuilder()
      .insert()
      .values(recordsToSave)
      .onConflict('("id") DO NOTHING')
      .execute()
  }

  async getMaxBlockNumber () {
    const records = await this.createQueryBuilder()
      .select(['"blockNumber"'])
      .orderBy('"blockNumber"', 'DESC')
      .limit(1)
      .execute()

    if (records.length === 0) {
      return this.DEFAULT_BLOCK_NUMBER
    }

    return records[0].blockNumber
  }
}

export default TradeHistoryRepository
