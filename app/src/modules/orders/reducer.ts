import * as types from './types'
import map from 'ramda/es/map'
import path from 'ramda/es/path'
import dissocPath from 'ramda/es/dissocPath'
import assocPath from 'ramda/es/assocPath'
import without from 'ramda/es/without'
import { OrderStatus } from '@0x/contract-wrappers'
import {
  mergeItemsReducer,
  resetItemsReducer,
  removeOrphanedItemsReducer
} from 'modules/reducerHelpers'

const HIGHLIGHT_PATH = ['extra', 'highlight']

const ENTITY_STORE_KEY = 'orders'
const getId = path(['metaData', 'orderHash'])

const LIST_TYPES = ['asks', 'bids', 'accountOrders']

const initialState = {
  orderbookLoaded: false,
  [ENTITY_STORE_KEY]: {}
}

for (let listType of LIST_TYPES) {
  initialState[listType] = []
}

const ordersReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_ORDERBOOK_LOADED:
      return { ...state, orderbookLoaded: payload }

    case types.SET_ORDERS_LIST:
      return mergeItemsReducer({
        state: resetItemsReducer(state, payload.listType),
        entityStoreKey: ENTITY_STORE_KEY,
        getId,
        itemsList: payload.orders,
        listType: payload.listType
      })

    case types.ADD_ORDERS_LIST:
      return mergeItemsReducer({
        state,
        getId,
        entityStoreKey: ENTITY_STORE_KEY,
        itemsList: highlightItems(state, payload.orders),
        listType: payload.listType
      })

    case types.RESET_HIGHLIGHTING:
      return resetHighlightReducer(state)

    default:
      return state
  }
}

const resetHighlightReducer = state => ({
  ...state,
  [ENTITY_STORE_KEY]: map(dissocPath(HIGHLIGHT_PATH), state[ENTITY_STORE_KEY])
})

export const highlightItems = (state, itemsList) => itemsList.map(assocPath(HIGHLIGHT_PATH, true))

const removeFulfilledOrdersReducer = state => {
  const keysToRemove = Object.keys(state[ENTITY_STORE_KEY]).filter(
    key => state[ENTITY_STORE_KEY][key].metaData.orderStatus !== OrderStatus.FILLABLE
  )

  if (keysToRemove.length === 0) {
    return state
  }

  let nextState = { ...state }
  for (let listType of LIST_TYPES) {
    nextState = {
      ...nextState,
      [listType]: without(keysToRemove, nextState[listType])
    }
  }

  return nextState
}

const wrappedOrdersReducer = (state, action) => {
  let nextState = ordersReducer(state, action)
  nextState = removeFulfilledOrdersReducer(nextState)
  return removeOrphanedItemsReducer({
    state: nextState,
    getId,
    entityStoreKey: ENTITY_STORE_KEY,
    listTypes: LIST_TYPES
  })
}

export default wrappedOrdersReducer
