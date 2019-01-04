import * as types from './types'

export const setTokens = payload => ({ type: types.SET_TOKENS, payload })
export const setAccount = payload => ({ type: types.SET_ACCOUNT, payload })
export const setNetwork = payload => ({ type: types.SET_NETWORK, payload })
export const setTokenBalance = (symbol, value) => ({ type: types.SET_TOKEN_BALANCE, payload: { symbol, value } })
export const setEthBalance = payload => ({ type: types.SET_ETH_BALANCE, payload })
export const setTokenAllowance = (symbol, value) => ({ type: types.SET_TOKEN_ALLOWANCE, payload: { symbol, value } })
export const setEnabled = payload => ({ type: types.SET_ENABLED, payload })
export const setMarkets = payload => ({ type: types.SET_MARKETS, payload })
