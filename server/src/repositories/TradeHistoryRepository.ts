import { EntityRepository, Repository, Brackets } from 'typeorm'
import TradeHistoryEntity from '../entities/TradeHistory'
import { EventType, IFillEntity } from '../types'
import AssetPairEntity from '../entities/AssetPair'
import { getNowUnixtime } from '../utils/helpers'

@EntityRepository(TradeHistoryEntity)
class TradeHistoryRepository extends Repository<any> {
  CHUNK_SIZE = 500

  async saveFullTradeHistory (recordsToSave) {
    return this.manager.transaction(async manager => {
      for (let i = 0; i < recordsToSave.length; i += this.CHUNK_SIZE) {
        await manager.save(
          TradeHistoryEntity,
          recordsToSave.slice(i, i + this.CHUNK_SIZE)
        )
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

  getAssetPairTradeHistoryAsync ({ baseAssetData, quoteAssetData, skip, take }) {
    return this.createQueryBuilder()
      .where('"event" = :event')
      .andWhere(new Brackets(qb => {
        qb.where('("makerAssetData" = :baseAssetData AND "takerAssetData" = :quoteAssetData)')
          .orWhere('("makerAssetData" = :quoteAssetData AND "takerAssetData" = :baseAssetData)')
      }))
      .setParameters({ baseAssetData, quoteAssetData, event: EventType.FILL })
      .skip(skip)
      .take(take)
      .orderBy('"blockNumber"', 'DESC')
      .getMany()
  }

  getAccountTradeHistoryAsync (address) {
    return this.createQueryBuilder()
      .where('"event" = :event')
      .andWhere(new Brackets(qb => {
        qb.where('"makerAddress" = :address')
          .orWhere('"takerAddress" = :address')
      }))
      .setParameters({ address, event: EventType.FILL })
      .orderBy('"blockNumber"', 'DESC')
      .addOrderBy('"id"', 'DESC')
      .getMany()
  }

  prepareAssetPairFillQuery (assetPair: AssetPairEntity) {
    return this.createQueryBuilder()
      .where('"event" = :event',)
      .andWhere(new Brackets(qb => {
        qb.where('("makerAssetData" = :baseAssetData AND "takerAssetData" = :quoteAssetData)')
          .orWhere('("makerAssetData" = :quoteAssetData AND "takerAssetData" = :baseAssetData)')
      }))
      .setParameters({
        event: EventType.FILL,
        baseAssetData: assetPair.assetDataA,
        quoteAssetData: assetPair.assetDataB
      })
  }

  getAssetPairRecordsAndCountForLast24Hours (assetPair: AssetPairEntity): Promise<[IFillEntity[], number]> {
    const query = this.prepareAssetPairFillQuery(assetPair)

    query.andWhere('"timestamp" >= :timestamp', { timestamp: getNowUnixtime() - 86400 })
      .orderBy({
        timestamp: 'DESC'
      })

    return query.getManyAndCount()
  }

  getLatestAssetPairFillEntity (assetPair: AssetPairEntity): Promise<IFillEntity> {
    const query = this.prepareAssetPairFillQuery(assetPair)

    query.orderBy({
      timestamp: 'DESC'
    })

    return query.getOne()
  }

  getLatestAssetPairFillEntityExclLast24Hours (assetPair: AssetPairEntity): Promise<IFillEntity> {
    const query = this.prepareAssetPairFillQuery(assetPair)

    query.andWhere('"timestamp" < :timestamp', { timestamp: getNowUnixtime() - 86400 })
      .orderBy({
        timestamp: 'DESC'
      })

    return query.getOne()
  }
}

export default TradeHistoryRepository
