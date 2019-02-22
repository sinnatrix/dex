import { IMarket, ITradeHistoryItem } from 'types'
import { isFillItem, isCancelItem } from 'modules/tradeHistory/helpers'

export const getPrice = (tradeHistoryItem: ITradeHistoryItem): number | undefined => {
  let price

  if (isFillItem(tradeHistoryItem)) {
    price = tradeHistoryItem.baseAssetFilledAmount / tradeHistoryItem.quoteAssetFilledAmount
  } else if (isCancelItem(tradeHistoryItem)) {
    price = tradeHistoryItem.baseAssetAmount / tradeHistoryItem.quoteAssetAmount
  }
  return price
}

export const getAmount = (tradeHistoryItem: ITradeHistoryItem): number | undefined => {
  let amount

  if (isFillItem(tradeHistoryItem)) {
    amount = tradeHistoryItem.baseAssetFilledAmount
  } else if (isCancelItem(tradeHistoryItem)) {
    amount = tradeHistoryItem.baseAssetAmount
  }

  return amount
}

export const isTradeHistoryItemForMarket = (tradeHistoryItem: ITradeHistoryItem, market: IMarket) =>
  tradeHistoryItem.baseAssetData === market.baseAsset.assetData &&
  tradeHistoryItem.quoteAssetData === market.quoteAsset.assetData
