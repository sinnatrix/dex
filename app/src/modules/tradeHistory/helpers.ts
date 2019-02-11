import { assetDataUtils } from '@0x/order-utils'
import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'
import { IFillEventLog, IFillEventLogWithStrings } from 'types'

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

export const convertTradeHistoryDecimalsToBigNumber = (tradeHistoryItem: IFillEventLogWithStrings): IFillEventLog => {
  const transformation = {
    makerAssetFilledAmount: toBN,
    takerAssetFilledAmount: toBN,
    makerFeePaid: toBN,
    takerFeePaid: toBN
  }

  return evolve(transformation, tradeHistoryItem as any) as any
}

export const isTradeHistoryItemForAssets = (tradeHistoryItem, assetA, assetB) =>
  isTradeHistoryItemHaveAssetData(tradeHistoryItem, assetA.assetData) &&
    isTradeHistoryItemHaveAssetData(tradeHistoryItem, assetB.assetData)

export const isTradeHistoryItemHaveAssetData = (tradeHistoryItem, assetData) =>
  tradeHistoryItem.makerAssetData === assetData || tradeHistoryItem.takerAssetData === assetData
