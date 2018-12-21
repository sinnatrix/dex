import AssetEntity from '../src/entities/Asset'
import { assetDataUtils } from '@0x/order-utils'
import { IRadarRelayAsset, ISRA2AssetPair, ISRA2AssetPairAsset } from '../src/types'
import AssetPairRepository from '../src/repositories/AssetPairRepository'
import AssetRepository from '../src/repositories/AssetRepository'

export const up = async (connection, networkName) => {
  const assets: IRadarRelayAsset[] = require(`./assets_${networkName}.json`)
  const assetPairs: ISRA2AssetPair[] = require(`./assetPairs_${networkName}.json`)

  const assetPairRepo = connection.getCustomRepository(AssetPairRepository)
  const assetRepo = connection.getCustomRepository(AssetRepository)

  for (let assetPair of assetPairs) {
    const assetA = getAssetEntity(assetPair.assetDataA, assets)
    const assetB = getAssetEntity(assetPair.assetDataB, assets)

    if (!assetA || !assetB) {
      console.log('One of assets not found')
      return
    }

    await assetRepo.insertIgnore([assetA, assetB])

    await assetPairRepo.save({ assetDataA: assetA.assetData, assetDataB: assetB.assetData })
  }
}

export const down = async () => {}

const getAssetEntity = (assetPairAsset: ISRA2AssetPairAsset, assets: IRadarRelayAsset[]): AssetEntity | undefined => {
  const decodedAssetData = assetDataUtils.decodeERC20AssetData(assetPairAsset.assetData)
  const radarRelayAsset = assets.find(one => one.address === decodedAssetData.tokenAddress)

  if (!radarRelayAsset) {
    return
  }

  return {
    assetData: assetPairAsset.assetData,
    address: decodedAssetData.tokenAddress,
    proxyId: decodedAssetData.assetProxyId,
    minAmount: assetPairAsset.minAmount,
    maxAmount: assetPairAsset.maxAmount,
    precision: assetPairAsset.precision,
    decimals: radarRelayAsset.decimals,
    symbol: radarRelayAsset.symbol,
    name: radarRelayAsset.name
  }
}