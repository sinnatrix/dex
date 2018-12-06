import descend from 'ramda/es/descend'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { convertTradeHistoryDecimalsToBigNumber } from './helpers'
import { IFillEventLog, IFillEventLogWithStrings } from 'types'

const sortByBlockNumberDesc = sortBy(descend(prop('blockNumber')))

const getTradeHistoryItemInDexFormatById = (id, state): IFillEventLog =>
  convertTradeHistoryDecimalsToBigNumber(getEventLogItemById(id, state))

const getEventLogItemById = (id, state): IFillEventLogWithStrings =>
  state.tradeHistory.tradeHistory[id]

export const getAccountTradeHistory = (state: any): IFillEventLog[] =>
  sortByBlockNumberDesc(state.tradeHistory.accountTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )

export const getAssetPairTradeHistory = (state: any): IFillEventLog[] =>
  sortByBlockNumberDesc(state.tradeHistory.assetPairTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )
