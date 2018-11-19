import { EntityRepository, Repository } from 'typeorm'
import TradeHistory from '../entities/TradeHistory'

@EntityRepository(TradeHistory as any)
class TradeHistoryRepository extends Repository<any> {
  async saveFullTradeHistory (recordsToSave) {
    return this.createQueryBuilder()
      .insert()
      .values(recordsToSave)
      .onConflict('("id") DO NOTHING')
      .execute()
  }
}

export default TradeHistoryRepository
