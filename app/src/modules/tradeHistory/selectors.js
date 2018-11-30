import descend from 'ramda/es/descend'
import sortBy from 'ramda/es/sortBy'
import prop from 'ramda/es/prop'
import { convertTradeHistoryDecimalsToBigNumber } from './helpers'

const sortByBlockNumberDesc = sortBy(descend(prop('blockNumber')))

const getTradeHistoryItemInDexFormatById = (id, state) =>
  convertTradeHistoryDecimalsToBigNumber(getTradeHistoryItemById(id, state))

const getTradeHistoryItemById = (id, state) => state.tradeHistory.tradeHistory[id]

export const getAccountTradeHistory = state =>
  sortByBlockNumberDesc(state.tradeHistory.accountTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )

export const getAssetPairTradeHistory = state =>
  sortByBlockNumberDesc(state.tradeHistory.assetPairTradeHistory.map(id =>
    getTradeHistoryItemInDexFormatById(id, state))
  )
