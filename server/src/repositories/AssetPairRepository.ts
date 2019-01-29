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
        COUNT(th.id) as "transactionCount"
      FROM
        "assetPairs" ap
      INNER JOIN
        assets ba
        ON
          ap."assetDataA" = ba."assetData"
      INNER JOIN
        assets qa
        ON
          ap."assetDataB" = qa."assetData"
      LEFT JOIN
        "tradeHistory" th
        ON
          th.event = 'Fill'
          AND
          (
            (th."makerAssetData" = qa."assetData" AND th."takerAssetData" = ba."assetData")
            OR
            (th."makerAssetData" = ba."assetData" AND th."takerAssetData" = qa."assetData")
          )
          AND
          th.timestamp > extract(epoch from now()) - 86400
      GROUP BY
        ap."assetDataA", ap."assetDataB", qa.symbol, ba.symbol
      ORDER BY
        "transactionCount" DESC
      ${limit ? 'LIMIT ' + limit : ''}
    `

    return this.query(sql)
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
