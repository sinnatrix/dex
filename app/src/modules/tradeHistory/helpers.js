import { assetDataUtils } from '@0x/order-utils'
import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'

export const expandTradeHistory = one => {
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(one.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(one.takerAssetData)

  return {
    ...one,
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}

export const convertTradeHistoryDecimalsToBigNumber = tradeHistoryItem => {
  const transformation = {
    makerAssetFilledAmount: toBN,
    takerAssetFilledAmount: toBN,
    makerFeePaid: toBN,
    takerFeePaid: toBN
  }

  return evolve(transformation, tradeHistoryItem)
}
