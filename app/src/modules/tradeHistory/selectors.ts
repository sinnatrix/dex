import descend from 'ramda/es/descend'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { convertTradeHistoryDecimalsToBigNumber, isTradeHistoryItemForAssets } from './helpers'
import { IFillEventLog, IFillEventLogWithStrings } from 'types'
import { getBaseAsset, getQuoteAsset } from '../global/selectors'

const sortByBlockNumberDesc = sortBy(
  descend(
    prop('blockNumber') as any
  ) as any
)

const getTradeHistoryItemInDexFormatById = (id, state): IFillEventLog =>
  convertTradeHistoryDecimalsToBigNumber(getEventLogItemById(id, state))

const getEventLogItemById = (id, state): IFillEventLogWithStrings =>
  state.tradeHistory.tradeHistory[id]

export const getAccountTradeHistory = (matchParams, state: any): IFillEventLog[] => {
  const baseAsset = getBaseAsset(matchParams, state)
  const quoteAsset = getQuoteAsset(matchParams, state)

  if (!baseAsset || !quoteAsset) {
    return []
  }

  return sortByBlockNumberDesc(
    state.tradeHistory.accountTradeHistory
      .map(id => getTradeHistoryItemInDexFormatById(id, state))
      .filter(one => isTradeHistoryItemForAssets(one, baseAsset, quoteAsset))
  )
}

export const getAssetPairTradeHistory = (state: any): IFillEventLog[] =>
  sortByBlockNumberDesc(state.tradeHistory.assetPairTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )

export const getAssetPairTradeHistoryLoaded = (state: any): boolean =>
  state.tradeHistory.assetPairTradeHistoryLoaded

export const getAccountTradeHistoryLoaded = (state: any): boolean =>
  state.tradeHistory.accountTradeHistoryLoaded
