import { Repository, EntityRepository } from 'typeorm'
import AssetPairEntity from '../entities/AssetPair'
import { ISRA2AssetPairs } from '../types'
import MarketsSqlBuilder from './MarketsSqlBuilder'
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

  async getTopRecordsByTxCount24Hours (limit?: number) {
    const builder = new MarketsSqlBuilder({
      connection: this.manager.connection
    })
    const sql = builder.build({ limit, interval: 86400 })

    await this.manager.connection.query('SET random_page_cost = 1')
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
