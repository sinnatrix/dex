import * as types from './types'

const initialState = {
  market: null,
  enabled: false,
  account: '',
  network: '',
  ethBalance: 0,
  tokenBalances: {},
  tokenAllowances: {},
  tokens: [],
  markets: [],
  marketCandles: [],
  priceChart: {
    intervals: [
      {
        id: '1d',
        active: true,
        name: '1 day',
        intervalSeconds: 24 * 60 * 60,
        groupIntervalSeconds: 3600,
        ticks: 6,
        tickFormat: '%H:%M'
      },
      {
        id: '1w',
        active: false,
        name: '1 week',
        intervalSeconds: 7 * 24 * 60 * 60,
        groupIntervalSeconds: 3 * 60 * 60,
        ticks: 6,
        tickFormat: '%a %d'
      },
      {
        id: '1m',
        active: false,
        name: '1 month',
        intervalSeconds: 30 * 24 * 60 * 60,
        groupIntervalSeconds: 24 * 60 * 60,
        ticks: 6,
        tickFormat: '%b %d'
      }
    ]
  }
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_ENABLED:
      return { ...state, enabled: payload }
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
    case types.SET_MARKETS:
      return { ...state, markets: payload }
    case types.SET_MARKET_CANDLES:
      return { ...state, marketCandles: payload }
    case types.SET_PRICE_CHART_INTERVAL:
      return {
        ...state,
        priceChart: {
          intervals: state.priceChart.intervals.map(one => ({
            ...one,
            active: payload === one.id
          }))
        }
      }
    default:
      return state
  }
}
