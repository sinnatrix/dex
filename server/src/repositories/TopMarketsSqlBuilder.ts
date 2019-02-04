import { SelectQueryBuilder, Connection } from 'typeorm'

export default class TopMarketsSqlBuilder {
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
        g."assetDataA",
        g."assetDataB",
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
}
