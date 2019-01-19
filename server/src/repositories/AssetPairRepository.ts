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
      .skip(skip)
      .take(take)
      .innerJoinAndSelect('assetPairs.assetA', 'assetsA')
      .innerJoinAndSelect('assetPairs.assetB', 'assetsB')

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

  getAllWithAssets () {
    const query = this.createQueryBuilder('assetPairs')
      .innerJoinAndSelect('assetPairs.assetA', 'assetsA')
      .innerJoinAndSelect('assetPairs.assetB', 'assetsB')

    return query.getMany()
  }
}
