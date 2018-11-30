import * as types from './types'

const initialState = {
  marketplaceToken: {},
  currentToken: {},
  enabled: false,
  account: '',
  network: '',
  ethBalance: 0,
  tokenBalances: {},
  tokenAllowances: {},
  tokens: []
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_ENABLED:
      return { ...state, enabled: payload }
    case types.SET_MARKETPLACE_TOKEN:
      return { ...state, marketplaceToken: payload }
    case types.SET_CURRENT_TOKEN:
      return { ...state, currentToken: payload }
    case types.SET_ACCOUNT:
      return { ...state, account: payload }
    case types.SET_NETWORK:
      return { ...state, network: payload }
    case types.SET_ETH_BALANCE:
      return { ...state, ethBalance: payload }
    case types.SET_TOKEN_BALANCE:
      return {
        ...state,
        tokenBalances: {
          ...state.tokenBalances,
          [payload.symbol]: payload.value
        }
      }
    case types.SET_TOKEN_ALLOWANCE:
      return {
        ...state,
        tokenAllowances: {
          ...state.tokenAllowances,
          [payload.symbol]: payload.value
        }
      }
    case types.SET_TOKENS:
      return { ...state, tokens: payload }
    default:
      return state
  }
}
