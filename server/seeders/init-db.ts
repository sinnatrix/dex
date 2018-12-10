import AssetEntity from '../src/entities/Asset'
import AssetPairEntity from '../src/entities/AssetPair'

const assets = require('./assets.json')
const assetPairs = require('./assetPairs.json')

export const up = async connection => {
  const assetRepo = connection.getRepository(AssetEntity)
  await assetRepo.save(assets)

  const assetPairRepo = connection.getRepository(AssetPairEntity)

  for (let { assetDataA, assetDataB } of assetPairs) {
    await assetPairRepo.save({
      assetDataA,
      assetDataB
    })
  }
}

export const down = async () => {}
