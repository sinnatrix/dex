import { BigNumber } from '@0x/utils'
import { convertMarketCandleToDepthChartPoint, convertMarketDecimalsToNumbers } from './helpers'
import { createSelector } from 'reselect'
import moize from 'moize'
import {
  ICandleWithStrings,
  IDexToken,
  IMarket,
  IPriceChartPoint,
  IState,
  ITokensState,
  ITokenAllowances,
  IPriceChartInterval,
  IMarketsState
} from 'types'

const shallowEqualArrays = require('shallow-equal/arrays')

export const DEFAULT_TOKEN = {
  id: 0,
  assetData: '',
  address: '',
  proxyId: '',
  minAmount: new BigNumber(0),
  maxAmount: new BigNumber(Number.MAX_SAFE_INTEGER),
  precision: 8,
  decimals: 18,
  symbol: '?',
  name: 'Unknown token',
  abi: {}
}

export const getTokensState = (state: IState): ITokensState => state.global.tokens

export const getMarketsState = (state: IState): IMarketsState => state.global.markets

export const getAccount = (state: IState): string => state.global.account

export const getNetworkName = (state: IState): string => state.global.network

export const getEthBalance = (state: IState): BigNumber => state.global.ethBalance

export const getMarketCandles = (state: IState): ICandleWithStrings[] => state.global.marketCandles

export const getTokens = moize((state: ITokensState): IDexToken[] =>
  state.result.map(symbol =>
    getTokenBySymbol(symbol, state)
  )
)

const memoizeTokensToDisplay = moize(tokensToDisplay => tokensToDisplay, {
  equals: shallowEqualArrays
})

export const getTokensToDisplay = (state: IState) => memoizeTokensToDisplay(
  getTokens(getTokensState(state))
    .filter(one => one.symbol !== 'WETH')
    .filter(one =>
      one.symbol === 'DAI' || getTokenBalance(one.symbol, state)
    )
)

export const getTokenBySymbol = (symbol: string, state: ITokensState): IDexToken =>
  state.entities.tokens[symbol] || DEFAULT_TOKEN

export const findTokenByAssetData = (assetData: string, tokens: IDexToken[]): IDexToken =>
  tokens.find(token => token.assetData === assetData) || DEFAULT_TOKEN

export const getMarkets = createSelector(
  getMarketsState,
  (markets: IMarketsState) => markets.result.map(id =>
    convertMarketDecimalsToNumbers(markets.entities.markets[id])
  )
)

const convertMarketDecimalsToNumbersCached = moize(convertMarketDecimalsToNumbers)

const getMarketById = (id: string, state: IState): IMarket | null => {
  const market = getMarketsState(state).entities.markets[id]
  if (!market) {
    return null
  }
  return convertMarketDecimalsToNumbersCached(market)
}

export const getMarket = (matchParams, state: IState) => {
  const { baseAssetSymbol, quoteAssetSymbol } = matchParams
  const id = `${baseAssetSymbol}-${quoteAssetSymbol}`
  return getMarketById(id, state)
}

export const getBaseAsset = (matchParams, state: IState) => {
  const market = getMarket(matchParams, state)

  return market ? market.baseAsset : null
}
export const getQuoteAsset = (matchParams, state: IState) => {
  const market = getMarket(matchParams, state)

  return market ? market.quoteAsset : null
}

export const getPriceChartPoints = (state: IState): IPriceChartPoint[] => {
  const candles = getMarketCandles(state)
  return convertCandlesToPriceChartPoints(candles)
}

export const convertCandlesToPriceChartPoints = moize(
  (candles: ICandleWithStrings[]): IPriceChartPoint[] =>
    candles.map(moize(convertMarketCandleToDepthChartPoint))
)

export const getActivePriceChartInterval = (state: IState): IPriceChartInterval =>
    state.global.priceChartInterval

const tokenAllowanceSelector = (state: IState): ITokenAllowances => state.global.tokenAllowances

export const getTokenAllowance = (symbol: string, state: IState) => tokenAllowanceSelector(state)[symbol]
export const getTokenBalance = (symbol: string, state: IState) => state.global.tokenBalances[symbol]
