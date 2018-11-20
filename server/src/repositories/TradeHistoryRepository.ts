import { EntityRepository, Repository } from 'typeorm'
import TradeHistory from '../entities/TradeHistory'

@EntityRepository(TradeHistory)
class TradeHistoryRepository extends Repository<any> {
  CHUNK_SIZE = 500

  async saveFullTradeHistory (recordsToSave) {
    return this.manager.transaction(async manager => {
      for (let i = 0; i < recordsToSave.length; i += this.CHUNK_SIZE) {
        await manager.save(TradeHistory, recordsToSave.slice(i, i + this.CHUNK_SIZE))
      }
    })
  }

  async getMaxBlockNumber () {
    const records = await this.createQueryBuilder()
      .select('MAX("blockNumber")')
      .execute()

    if (records.length === 0) {
      return -1
    }

    return +records[0].max
  }
}

export default TradeHistoryRepository
