import { assetDataUtils } from '@0x/order-utils'
import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'
import {
  EventType,
  ICancelItem,
  ICancelItemWithoutOrder,
  IFillItem,
  ITradeHistoryItem,
  TradeHistoryEntity
} from 'types'
import moize from 'moize'

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

const convertTradeHistoryDecimalsToBigNumbersRaw = (tradeHistoryItem: TradeHistoryEntity): ITradeHistoryItem => {
  const transformation = {
    makerAssetFilledAmount: toBN,
    takerAssetFilledAmount: toBN,
    makerFeePaid: toBN,
    takerFeePaid: toBN
  }

  return evolve(transformation, tradeHistoryItem as any) as any
}

export const convertTradeHistoryDecimalsToBigNumbers = moize(convertTradeHistoryDecimalsToBigNumbersRaw)

export const isFillItem = (item: ITradeHistoryItem): item is IFillItem => item.event === EventType.FILL

export const isCancelItem = (item: ITradeHistoryItem): item is ICancelItem =>
  item.event === EventType.CANCEL && !item.baseAssetFilledAmount && !!item.baseAssetAmount

export const isCancelItemWithoutOrder = (item: ITradeHistoryItem): item is ICancelItemWithoutOrder =>
  item.event === EventType.CANCEL && !item.baseAssetFilledAmount && !item.baseAssetAmount
