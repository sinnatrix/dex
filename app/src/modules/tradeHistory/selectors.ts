import descend from 'ramda/es/descend'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { convertTradeHistoryDecimalsToBigNumber, isTradeHistoryItemForAssets } from './helpers'
import { IFillEventLog, IState, TradeHistoryEntity } from 'types'
import { getBaseAsset, getQuoteAsset } from 'selectors'

const sortByBlockNumberDesc = sortBy(
  descend(
    prop('blockNumber') as any
  ) as any
)

const getTradeHistoryItemInDexFormatById = (id: string, state: IState): IFillEventLog =>
  convertTradeHistoryDecimalsToBigNumber(getEventLogItemById(id, state))

const getEventLogItemById = (id: string, state: IState): TradeHistoryEntity =>
  state.tradeHistory.tradeHistory[id]

export const getAccountTradeHistory = (matchParams, state: IState): IFillEventLog[] => {
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

export const getAssetPairTradeHistory = (state: IState): IFillEventLog[] =>
  sortByBlockNumberDesc(state.tradeHistory.assetPairTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )

export const getAssetPairTradeHistoryLoaded = (state: IState): boolean =>
  state.tradeHistory.assetPairTradeHistoryLoaded

export const getAccountTradeHistoryLoaded = (state: IState): boolean =>
  state.tradeHistory.accountTradeHistoryLoaded
