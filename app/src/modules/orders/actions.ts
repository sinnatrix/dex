import * as types from './types'

const setOrdersList = (orders, listType) => ({ type: types.SET_ORDERS_LIST, payload: { orders, listType } })
const addOrdersList = (orders, listType) => ({ type: types.ADD_ORDERS_LIST, payload: { orders, listType } })

export const setAccountOrders = orders => setOrdersList(orders, 'accountOrders')
export const addAccountOrders = orders => addOrdersList(orders, 'accountOrders')

export const setOrderbookBids = orders => setOrdersList(orders, 'bids')
export const setOrderbookAsks = orders => setOrdersList(orders, 'asks')
export const addOrderbookBids = orders => addOrdersList(orders, 'bids')
export const addOrderbookAsks = orders => addOrdersList(orders, 'asks')

export const setOrderbookLoaded = payload => ({ type: types.SET_ORDERBOOK_LOADED, payload })

export const resetHighlighting = () => ({ type: types.RESET_HIGHLIGHTING })
