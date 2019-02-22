import * as types from './types'
import prop from 'ramda/es/prop'
import { mergeItemsReducer, resetItemsReducer } from 'modules/reducerHelpers'
import { ITradeHistoryStateSection } from 'types'

const getId = prop('id')

const ENTITY_STORE_KEY = 'tradeHistory'

const initialState: ITradeHistoryStateSection = {
  assetPairTradeHistoryLoaded: false,
  accountTradeHistoryLoaded: false,
  [ENTITY_STORE_KEY]: {},
  assetPairTradeHistory: [],
  accountTradeHistory: []
}

const tradeHistoryReducer = (state: ITradeHistoryStateSection = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_ASSET_PAIR_TRADE_HISTORY_LOADED:
      return { ...state, assetPairTradeHistoryLoaded: !!payload }

    case types.SET_ACCOUNT_TRADE_HISTORY_LOADED:
      return { ...state, accountTradeHistoryLoaded: !!payload }

    case types.SET_TRADE_HISTORY_LIST:
      return mergeItemsReducer({
        state: resetItemsReducer(state, payload.listType),
        entityStoreKey: ENTITY_STORE_KEY,
        getId,
        itemsList: payload.tradeHistoryItems,
        listType: payload.listType
      })

    case types.ADD_TRADE_HISTORY_LIST:
      return mergeItemsReducer({
        state,
        getId,
        entityStoreKey: ENTITY_STORE_KEY,
        itemsList: payload.tradeHistoryItems,
        listType: payload.listType
      })

    default:
      return state
  }
}

export default tradeHistoryReducer
