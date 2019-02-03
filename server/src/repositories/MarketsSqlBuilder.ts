import { SelectQueryBuilder, Connection } from 'typeorm'

export default class MarketsSqlBuilder {
  connection: Connection
  qb: SelectQueryBuilder<any>
  constructor ({ connection }) {
    this.connection = connection
    this.qb = this.connection.createQueryBuilder()
  }

  build ({ limit, interval }) {
    const sql = `
      SELECT
        CONCAT(qa.symbol, '-', ba.symbol) "marketId",
        p."price",
        pe."price" "priceExcl24",
        g."transactionsCount",
        g.volume
      FROM
        (${this.buildVolumeAndTransactionsSql({ limit, interval })}) g
      INNER JOIN
        assets ba
        ON
          g."assetDataA" = ba."assetData"
      INNER JOIN
        assets qa
        ON
          g."assetDataB" = qa."assetData"
      LEFT JOIN (${this.buildLatestPricesSql()}) p
        ON
          p."makerAssetData"=g."assetDataB"
          AND
          p."takerAssetData"=g."assetDataA"
      LEFT JOIN (${this.buildLatestPricesExclLastIntervalSql({ interval })}) pe
        ON
          pe."makerAssetData"=g."assetDataB"
          AND
          pe."takerAssetData"=g."assetDataA"
      ORDER BY
        g."transactionsCount" DESC
    `
    return sql
  }

  buildVolumeAndTransactionsSql ({ limit, interval }) {
    const timestampCond = Math.floor(Date.now() / 1000) - interval

    return `
      SELECT
        (
          (CASE WHEN th1."transactionsCount" IS NULL THEN 0 ELSE th1."transactionsCount" END)
          +
          (CASE WHEN th2."transactionsCount" IS NULL THEN 0 ELSE th2."transactionsCount" END)
        ) "transactionsCount",
        ap."assetDataA",
        ap."assetDataB",
        (
          (CASE WHEN th1.volume IS NULL THEN 0 ELSE th1.volume END)
          +
          (CASE WHEN th2.volume IS NULL THEN 0 ELSE th2.volume END)
        ) volume
      FROM
        "assetPairs" ap
      LEFT JOIN (
        SELECT
          COUNT(*) "transactionsCount",
          "makerAssetData",
          "takerAssetData",
          SUM("takerAssetFilledAmount") volume
        FROM
          "tradeHistory"
        WHERE
          event = 'Fill'
          AND
          timestamp > ${timestampCond}
        GROUP BY
          "makerAssetData",
          "takerAssetData"
        ORDER BY
          "transactionsCount" DESC
      ) th1
      ON
        th1."makerAssetData" = ap."assetDataB"
        AND
        th1."takerAssetData" = ap."assetDataA"
      LEFT JOIN (
        SELECT
          COUNT(*) "transactionsCount",
          "makerAssetData",
          "takerAssetData",
          SUM("makerAssetFilledAmount") volume
        FROM
          "tradeHistory"
        WHERE
          event = 'Fill'
          AND
          timestamp > ${timestampCond}
        GROUP BY
          "makerAssetData",
          "takerAssetData"
        ORDER BY
          "transactionsCount" DESC
      ) th2
      ON
        th2."makerAssetData" = ap."assetDataA"
        AND
        th2."takerAssetData" = ap."assetDataB"
      ORDER BY
        "transactionsCount" DESC,
        volume DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `
  }

  buildLatestPricesExclLastIntervalSql ({ interval }) {
    const timestampCond = Math.floor(Date.now() / 1000) - interval

    const baseQuery = this.buildPricesBaseQuery()
      .andWhere(`"timestamp" <= ${timestampCond}`)

    return this.buildPricesSqlWithBaseQuery(baseQuery)
  }

  buildLatestPricesSql () {
    const baseQuery = this.buildPricesBaseQuery()

    return this.buildPricesSqlWithBaseQuery(baseQuery)
  }

  buildPricesSqlWithBaseQuery (baseQuery: SelectQueryBuilder<any>) {
    const asksPricesSql = baseQuery
      .orderBy(`"takerAssetData" DESC, "makerAssetData" DESC, "timestamp"`, 'DESC')
      .getSql()

    const bidsPricesSql = baseQuery
      .orderBy(`"makerAssetData" DESC, "takerAssetData" DESC, "timestamp"`, 'DESC')
      .getSql()

    return `
      SELECT
        (CASE WHEN a."makerAssetData" IS NULL THEN b."takerAssetData" ELSE a."makerAssetData" END) "makerAssetData",
        (CASE WHEN a."takerAssetData" IS NULL THEN b."makerAssetData" ELSE a."takerAssetData" END) "takerAssetData",
        (
          CASE
            WHEN a."timestamp" IS NULL OR b."timestamp" > a."timestamp"
            THEN b."makerAssetFilledAmount" / b."takerAssetFilledAmount"
            ELSE a."takerAssetFilledAmount" / a."makerAssetFilledAmount"
          END
        ) "price"
      FROM
        (${asksPricesSql}) a
      FULL OUTER JOIN
        (${bidsPricesSql}) b
      ON
        a."makerAssetData"=b."takerAssetData"
        AND
        a."takerAssetData"=b."makerAssetData"
    `
  }

  buildPricesBaseQuery () {
    return this.connection.createQueryBuilder()
      .select(`
        DISTINCT ON("takerAssetData", "makerAssetData")
          "takerAssetFilledAmount",
          "makerAssetFilledAmount",
          "makerAssetData",
          "takerAssetData",
          "timestamp"
      `)
      .from('tradeHistory', 'th')
      .where(`"event" = 'Fill'`)
  }
}
