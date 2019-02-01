import { EntityRepository, Repository, Brackets } from 'typeorm'
import TradeHistoryEntity from '../entities/TradeHistory'
import { EventType, IFillEntity } from '../types'
import { BigNumber } from '@0x/utils'
import AssetPairEntity from '../entities/AssetPair'
import { getNowUnixtime } from '../utils/helpers'

@EntityRepository(TradeHistoryEntity)
class TradeHistoryRepository extends Repository<any> {
  CHUNK_SIZE = 500
  SECONDS_IN_DAY = 86400

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

  async getMaxBlockNumber (): Promise<number> {
    const records = await this.createQueryBuilder()
      .select('MAX("blockNumber")')
      .execute()

    if (records.length === 0 || records[0].max === null) {
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
      .where('"event" = :event')
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

  async getAssetPairRecordsAndCountForLast24Hours (assetPair: AssetPairEntity): Promise<{volume: BigNumber, count: number}> {
    const query = this.prepareAssetPairFillQuery(assetPair)

    query
      .select('COUNT(*)', 'count')
      .addSelect(`(
        SUM(
          CASE WHEN "makerAssetData" = :quoteAssetData THEN "takerAssetFilledAmount" ELSE 0 END
        )
        +
        SUM(
          CASE WHEN "takerAssetData" = :quoteAssetData THEN "makerAssetFilledAmount" ELSE 0 END
        )
      )`, 'volume')
      .andWhere('"timestamp" >= :timestamp', { timestamp: getNowUnixtime() - this.SECONDS_IN_DAY })

    const { count, volume } = await query.getRawOne()

    return {
      volume: new BigNumber(volume || '0'),
      count: parseInt(count, 10)
    }
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

    query.andWhere('"timestamp" < :timestamp', { timestamp: getNowUnixtime() - this.SECONDS_IN_DAY })
      .orderBy({
        timestamp: 'DESC'
      })

    return query.getOne()
  }

  async getMarketCandles ({ quoteAssetSymbol, baseAssetSymbol, fromTimestamp, toTimestamp, groupIntervalSeconds }) {
    const { FILL: event } = EventType

    const sql = `
      WITH history AS (
        SELECT
          (
            CASE
              WHEN
                ba."assetData" = th."makerAssetData"
              THEN
                th."makerAssetFilledAmount"
              ELSE
                th."takerAssetFilledAmount"
            END / (10 ^ ba.decimals)::decimal
          ) "baseAssetVolume",
          (
            CASE
              WHEN
                qa."assetData" = th."makerAssetData"
              THEN
                th."makerAssetFilledAmount"
              ELSE
                th."takerAssetFilledAmount"
            END / (10 ^ qa.decimals)::decimal
          ) "quoteAssetVolume",
          (
            CASE
              WHEN
                ta."assetData" = qa."assetData"
              THEN
                th."takerAssetFilledAmount" / th."makerAssetFilledAmount"::decimal
              ELSE
                th."makerAssetFilledAmount" / th."takerAssetFilledAmount"::decimal
            END
          ) price,
          th.timestamp,
          (floor(timestamp / $1) * $1) "groupTimestamp"
        FROM "assetPairs" ap
        INNER JOIN
          assets ba
        ON
          ap."assetDataB" = ba."assetData"
        INNER JOIN
          assets qa
        ON
          ap."assetDataA" = qa."assetData"
        INNER JOIN
          "tradeHistory" th
        ON
          th.event = $2
          AND
          (
            (th."makerAssetData" = qa."assetData" AND th."takerAssetData" = ba."assetData")
            OR
            (th."makerAssetData" = ba."assetData" AND th."takerAssetData" = qa."assetData")
          )
        INNER JOIN
          assets ma
        ON
          th."makerAssetData" = ma."assetData"
        INNER JOIN
          assets ta
        ON
          th."takerAssetData" = ta."assetData"
        WHERE
          ba.symbol IN ($3, $4)
          AND
          qa.symbol IN ($3, $4)
          AND
          th."timestamp" >= $5
          AND
          th."timestamp" < $6
      ),
      groupedHistory AS (
        SELECT
          SUM(h."baseAssetVolume") "baseAssetVolume",
          SUM(h."quoteAssetVolume") "quoteAssetVolume",
          MAX(h.price) high,
          MIN(h.price) low,
          MIN(h.timestamp) "openTimestamp",
          MAX(h.timestamp) "closeTimestamp",
          h."groupTimestamp" "timestamp"
        FROM
          history h
        GROUP BY
          h."groupTimestamp"
      )
      SELECT
        (groupedHistory."quoteAssetVolume" + groupedHistory."baseAssetVolume") volume,
        groupedHistory.high,
        groupedHistory.low,
        groupedHistory.timestamp,
        (
          SELECT DISTINCT ON (h1.timestamp)
            price
          FROM
            history h1
          WHERE
            h1.timestamp = groupedHistory."openTimestamp"
          LIMIT 1
        ) "open",
        (
          SELECT DISTINCT ON (h1.timestamp)
            price
          FROM
            history h1
          WHERE
            h1.timestamp = groupedHistory."closeTimestamp"
          LIMIT 1
        ) "close"
      FROM
        groupedHistory
      ORDER BY
        "timestamp" ASC
    `
    return this.query(sql,
      [
        groupIntervalSeconds,
        event,
        baseAssetSymbol,
        quoteAssetSymbol,
        fromTimestamp,
        toTimestamp
      ])
  }
}

export default TradeHistoryRepository
