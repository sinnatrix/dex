import { EntityRepository, Repository, Brackets } from 'typeorm'
import TradeHistoryEntity from '../entities/TradeHistory'
import { EventType, IFillEntity, IFillItem, ITradeHistoryItem, OrderType } from '../types'
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

  getTradeHistoryItemsSql () {
    return `
      SELECT
        CASE
          WHEN apBid IS NOT NULL THEN '${OrderType.BID}'
          WHEN apAsk IS NOT NULL THEN '${OrderType.ASK}'
          ELSE NULL
        END AS "orderType",
        CASE
          WHEN apBid IS NOT NULL THEN th."takerAssetData"
          WHEN apAsk IS NOT NULL THEN th."makerAssetData"
        END AS "quoteAssetData",
        CASE
          WHEN apBid IS NOT NULL THEN th."makerAssetData"
          WHEN apAsk IS NOT NULL THEN th."takerAssetData"
        END AS "baseAssetData",
        CASE
          WHEN apBid IS NOT NULL
            THEN (th."takerAssetFilledAmount" / 10 ^ ta.decimals)
          WHEN apAsk IS NOT NULL
            THEN (th."makerAssetFilledAmount" / 10 ^ ma.decimals)
        END AS "baseAssetFilledAmount",
        CASE
          WHEN apBid IS NOT NULL
            THEN (th."makerAssetFilledAmount" / 10 ^ ma.decimals)
          WHEN apAsk IS NOT NULL
            THEN (th."takerAssetFilledAmount" / 10 ^ ta.decimals)
        END AS "quoteAssetFilledAmount",
        CASE
          WHEN apBid IS NOT NULL AND o IS NOT NULL
            THEN (o."takerAssetAmount" / 10 ^ ta.decimals)
          WHEN apAsk IS NOT NULL
            THEN (o."makerAssetAmount" / 10 ^ ma.decimals)
        END AS "baseAssetAmount",
        CASE
          WHEN apBid IS NOT NULL AND o IS NOT NULL
            THEN (o."makerAssetAmount" / 10 ^ ma.decimals)
          WHEN apAsk IS NOT NULL
            THEN (o."takerAssetAmount" / 10 ^ ta.decimals)
        END AS "quoteAssetAmount",
        th.*
      FROM
        "tradeHistory" th
      LEFT JOIN
        "assetPairs" apBid
        ON apBid."assetDataB" = th."makerAssetData"
          AND apBid."assetDataA" = th."takerAssetData"
      LEFT JOIN
        "assetPairs" apAsk
        ON apAsk."assetDataA" = th."makerAssetData"
          AND apAsk."assetDataB" = th."takerAssetData"
      LEFT JOIN
        assets ma
        ON ma."assetData" = th."makerAssetData"
      LEFT JOIN
        assets ta
        ON ta."assetData" = th."takerAssetData"
      LEFT JOIN
        orders o
        ON o."orderHash" = th."orderHash"
    `
  }

  getAssetPairTradeHistoryAsync ({
    baseAssetData,
    quoteAssetData,
    skip,
    take
  }: {
    baseAssetData: string,
    quoteAssetData: string,
    skip: number,
    take: number
  }): Promise<IFillItem[]> {
    let sql = this.getTradeHistoryItemsSql()

    sql += `
      WHERE (
        (th."makerAssetData" = $1 AND th."takerAssetData" = $2)
        OR
        (th."takerAssetData" = $1 AND th."makerAssetData" = $2)
      ) AND (
        th.event = $3
      )
      ORDER BY
        th."blockNumber" DESC,
        th."logIndex" DESC
      LIMIT $4 OFFSET $5
    `

    return this.query(
      sql, [
        baseAssetData,
        quoteAssetData,
        EventType.FILL,
        take,
        skip
      ]
    )
  }

  async getTradeHistoryItemById (id: string): Promise<ITradeHistoryItem[]> {
    let sql = this.getTradeHistoryItemsSql()

    sql += `
      WHERE
        th.id = $1
    `

    return this.query(sql, [id])
  }

  getAccountTradeHistoryAsync (address: string): Promise<ITradeHistoryItem[]> {
    let sql = this.getTradeHistoryItemsSql()
    sql += `
      WHERE (
        th."makerAddress" = $1
        OR
        th."takerAssetData" = $1
      ) AND (
        th.event = $2
        OR
        th.event = $3
      )
      ORDER BY
        th."blockNumber" DESC,
        th."logIndex" DESC
    `

    return this.query(
      sql, [
        address,
        EventType.FILL,
        EventType.CANCEL
      ]
    )
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

  async getAssetPairVolumeAndCountForLast24Hours (assetPair: AssetPairEntity): Promise<{volume: BigNumber, count: number}> {
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

    query
      .orderBy({
        timestamp: 'DESC'
      })
      .limit(1)

    return query.getOne()
  }

  getLatestAssetPairFillEntityExclLast24Hours (assetPair: AssetPairEntity): Promise<IFillEntity> {
    const query = this.prepareAssetPairFillQuery(assetPair)

    query
      .andWhere('"timestamp" < :timestamp', { timestamp: getNowUnixtime() - this.SECONDS_IN_DAY })
      .orderBy({
        timestamp: 'DESC'
      })
      .limit(1)

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
