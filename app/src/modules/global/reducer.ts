import * as types from './types'
import assocPath from 'ramda/es/assocPath'
import mergeDeepRight from 'ramda/es/mergeDeepRight'
import { BigNumber } from '@0x/utils'
import { IGlobalStateSection } from 'types'

const initialState: IGlobalStateSection = {
  enabled: false,
  account: '',
  applicationNetwork: undefined,
  clientNetwork: undefined,
  ethBalance: new BigNumber(0),
  tokenBalances: {},
  tokenAllowances: {},
  tokens: {
    entities: {
      tokens: {}
    },
    result: []
  },
  markets: {
    entities: {
      markets: {}
    },
    result: []
  },
  marketLoaded: false,
  marketsLoaded: false,
  marketCandles: [],
  priceChartInterval: {
    id: '1d',
    name: '1 day',
    intervalSeconds: 24 * 60 * 60,
    groupIntervalSeconds: 3600,
    ticks: 6,
    tickFormat: '%H:%M'
  }
}

export default (state: IGlobalStateSection = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_ENABLED:
      return { ...state, enabled: payload }

    case types.SET_ACCOUNT:
      return { ...state, account: payload }

    case types.SET_APPLICATION_NETWORK:
      return { ...state, applicationNetwork: payload }

    case types.SET_CLIENT_NETWORK:
      return { ...state, clientNetwork: payload }

    case types.SET_ETH_BALANCE:
      return { ...state, ethBalance: payload }

    case types.SET_TOKEN_BALANCE:
      return assocPath(['tokenBalances', payload.symbol], payload.value, state)

    case types.SET_TOKEN_ALLOWANCE:
      return assocPath(['tokenAllowances', payload.symbol], payload.value, state)

    case types.MERGE_TOKENS:
      return {
        ...state,
        tokens: mergeDeepRight(state.tokens, payload)
      }

    case types.MERGE_MARKETS:
      return {
        ...state,
        markets: mergeDeepRight(
          state.markets,
          payload
        )
      }

    case types.ADD_MARKET:
      return {
        ...state,
        markets: {
          ...state.markets,
          entities: {
            ...state.markets.entities,
            markets: {
              ...state.markets.entities.markets,
              [payload.id]: payload
            }
          }
        }
      }

    case types.SET_MARKET_CANDLES:
      return { ...state, marketCandles: payload }

    case types.SET_PRICE_CHART_INTERVAL:
      return {
        ...state,
        priceChartInterval: payload
      }

    case types.SET_MARKETS_LOADED:
      return {
        ...state,
        marketsLoaded: payload
      }

    case types.SET_MARKET_LOADED:
      return {
        ...state,
        marketLoaded: payload
      }

    default:
      return state
  }
}
