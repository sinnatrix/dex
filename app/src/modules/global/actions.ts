import * as types from './types'

export const setMarketplaceToken = payload => ({ type: types.SET_MARKETPLACE_TOKEN, payload })
export const setCurrentToken = payload => ({ type: types.SET_CURRENT_TOKEN, payload })
export const setTokens = payload => ({ type: types.SET_TOKENS, payload })
export const setAccount = payload => ({ type: types.SET_ACCOUNT, payload })
export const setNetwork = payload => ({ type: types.SET_NETWORK, payload })
export const setTokenBalance = (symbol, value) => ({ type: types.SET_TOKEN_BALANCE, payload: { symbol, value } })
export const setEthBalance = payload => ({ type: types.SET_ETH_BALANCE, payload })
export const setTokenAllowance = (symbol, value) => ({ type: types.SET_TOKEN_ALLOWANCE, payload: { symbol, value } })
export const setEnabled = payload => ({ type: types.SET_ENABLED, payload })
