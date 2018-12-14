import AssetEntity from '../src/entities/Asset'
import AssetPairEntity from '../src/entities/AssetPair'


export const up = async (connection, networkName) => {
  const assets = require(`./assets_${networkName}.json`)
  const assetPairs = require(`./assetPairs_${networkName}.json`)


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
