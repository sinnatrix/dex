import * as types from './types'

const setTradeHistoryList = (tradeHistoryItems, listType) =>
  ({ type: types.SET_TRADE_HISTORY_LIST, payload: { tradeHistoryItems, listType } })
const addTradeHistoryList = (tradeHistoryItems, listType) =>
  ({ type: types.ADD_TRADE_HISTORY_LIST, payload: { tradeHistoryItems, listType } })

export const addAccountTradeHistory = tradeHistoryItems =>
  addTradeHistoryList(tradeHistoryItems, 'accountTradeHistory')

export const addAssetPairTradeHistory = tradeHistoryItems =>
  addTradeHistoryList(tradeHistoryItems, 'assetPairTradeHistory')

export const setAccountTradeHistory = tradeHistoryItems =>
  setTradeHistoryList(tradeHistoryItems, 'accountTradeHistory')

export const setAssetPairTradeHistory = tradeHistoryItems =>
  setTradeHistoryList(tradeHistoryItems, 'assetPairTradeHistory')

export const setAssetPairTradeHistoryLoaded = payload => ({
  type: types.SET_ASSET_PAIR_TRADE_HISTORY_LOADED,
  payload
})

export const setAccountTradeHistoryLoaded = payload => ({
  type: types.SET_ACCOUNT_TRADE_HISTORY_LOADED,
  payload
})
