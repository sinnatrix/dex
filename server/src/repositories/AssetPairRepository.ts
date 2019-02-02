import { Repository, EntityRepository } from 'typeorm'
import AssetPairEntity from '../entities/AssetPair'
import { ISRA2AssetPairs } from '../types'
import * as R from 'ramda'

@EntityRepository(AssetPairEntity)
export default class AssetPairRepository extends Repository<AssetPairEntity> {
  async getAssetPairsWithAssetsAndCount ({
    assetDataA = '',
    assetDataB = '',
    page = 1,
    perPage: take = 100
  }): Promise<ISRA2AssetPairs> {
    const skip = take * (page - 1)

    let query = this.createQueryBuilder('assetPairs')
      .innerJoinAndSelect('assetPairs.assetA', 'assetA')
      .innerJoinAndSelect('assetPairs.assetB', 'assetB')
      .skip(skip)
      .take(take)

    if (assetDataA && assetDataB) {
      query.where('"assetPairs"."assetDataA" = :assetDataA', { assetDataA })
        .andWhere('"assetPairs"."assetDataB" = :assetDataB', { assetDataB })
    } else if (assetDataA && !assetDataB) {
      query.where('"assetPairs"."assetDataA" = :assetDataA', { assetDataA })
    } else if (!assetDataA && assetDataB) {
      query.where('"assetPairs"."assetDataB" = :assetDataB', { assetDataB })
    }

    const [ assetPairs, total ] = await query.getManyAndCount()

    const records = assetPairs.map(one => ({
      assetDataA: R.pick(['minAmount', 'maxAmount', 'precision', 'assetData'], one.assetA),
      assetDataB: R.pick(['minAmount', 'maxAmount', 'precision', 'assetData'], one.assetB)
    }))

    return {
      total,
      page,
      perPage: take,
      records
    }
  }

  getTopRecordsByTxCount24Hours (limit?: number) {
    const sql = `
      SELECT
        CONCAT(qa.symbol, '-', ba.symbol) "marketId",
        p."price",
        g."transactionsCount",
        g.volume
      FROM (
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
            timestamp > extract(epoch from now()) - 86400
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
            timestamp > extract(epoch from now()) - 86400
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
      ) g
      INNER JOIN
        assets ba
        ON
          g."assetDataA" = ba."assetData"
      INNER JOIN
        assets qa
        ON
          g."assetDataB" = qa."assetData"
      LEFT JOIN (
        SELECT
          (CASE WHEN t1."makerAssetData" IS NULL THEN t2."takerAssetData" ELSE t1."makerAssetData" END) "makerAssetData",
          (CASE WHEN t1."takerAssetData" IS NULL THEN t2."makerAssetData" ELSE t1."takerAssetData" END) "takerAssetData",
          (
            CASE
              WHEN t1."timestamp" IS NULL OR t2."timestamp" > t1."timestamp"
              THEN t2."makerAssetFilledAmount" / t2."takerAssetFilledAmount"
              ELSE t1."takerAssetFilledAmount" / t1."makerAssetFilledAmount"
            END
          ) "price"
        FROM (
          SELECT DISTINCT ON("takerAssetData", "makerAssetData")
            "takerAssetFilledAmount",
            "makerAssetFilledAmount",
            "makerAssetData",
            "takerAssetData",
            "timestamp"
          FROM
            "tradeHistory"
          WHERE
            "event" = 'Fill'
            AND
            "timestamp" > extract(epoch from now()) - 86400
          ORDER BY
            "takerAssetData", "makerAssetData", "timestamp" DESC
        ) t1
        FULL OUTER JOIN
        (
          SELECT DISTINCT ON("makerAssetData", "takerAssetData")
            "takerAssetFilledAmount",
            "makerAssetFilledAmount",
            "makerAssetData",
            "takerAssetData",
            "timestamp"
          FROM
            "tradeHistory"
          WHERE
            "event" = 'Fill'
            AND
            "timestamp" > extract(epoch from now()) - 86400
          ORDER BY
            "makerAssetData", "takerAssetData", "timestamp" DESC
        ) t2
        ON
          t1."makerAssetData"=t2."takerAssetData"
          AND
          t1."takerAssetData"=t2."makerAssetData"
      ) p
        ON
          p."makerAssetData"=g."assetDataB"
          AND
          p."takerAssetData"=g."assetDataA"
      ORDER BY
        g."transactionsCount" DESC
    `
    return this.query(sql)
  }

  async getByAssetPairSymbolsString (symbolsString: string) {
    const [ baseAssetSymbol, quoteAssetSymbol ] = symbolsString.split('-')

    return this.getByAssetPairSymbols(quoteAssetSymbol, baseAssetSymbol)
  }

  async getByAssetPairSymbols (
    assetASymbol: string,
    assetBSymbol: string
  ): Promise<AssetPairEntity | undefined> {
    const query = this.createQueryBuilder('assetPairs')
      .innerJoinAndSelect(
        'assetPairs.assetA',
        'assetA',
        '"assetA".symbol = :assetASymbol',
        { assetASymbol }
      )
      .innerJoinAndSelect(
        'assetPairs.assetB',
        'assetB',
        '"assetB".symbol = :assetBSymbol',
        { assetBSymbol }
      )

    return query.getOne()
  }
}
