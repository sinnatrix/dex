import { BigNumber } from '@0x/utils'
import { ICandleWithStrings, IDexToken, IMarket, IPriceChartPoint, ITokensState } from 'types'
import { convertMarketCandleToDepthChartPoint, convertMarketDecimalsToNumbers } from './helpers'
import { createSelector } from 'reselect'
import moize from 'moize'

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

export const getAccount = state => state.global.account

export const getTokensState = state => state.global.tokens

export const getTokens = moize((state: ITokensState) =>
  state.result.map(symbol =>
    getTokenBySymbol(symbol, state)
  )
)

const memoizeTokensToDisplay = moize(tokensToDisplay => tokensToDisplay, {
  equals: shallowEqualArrays
})

export const getTokensToDisplay = (state: any) => memoizeTokensToDisplay(
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
  (state: any) => state.global.markets,
  (markets: any) => markets.result.map(id =>
    convertMarketDecimalsToNumbers(markets.entities.markets[id])
  )
)

const convertMarketDecimalsToNumbersCached = moize(convertMarketDecimalsToNumbers)

const getMarketById = (id: string, state: any): IMarket | null => {
  const market = state.global.markets.entities.markets[id]
  if (!market) {
    return null
  }
  return convertMarketDecimalsToNumbersCached(market)
}

export const getMarket = (matchParams, state) => {
  const { baseAssetSymbol, quoteAssetSymbol } = matchParams
  const id = `${baseAssetSymbol}-${quoteAssetSymbol}`
  return getMarketById(id, state)
}

export const getBaseAsset = (matchParams, state) => {
  const market = getMarket(matchParams, state)

  return market ? market.baseAsset : null
}
export const getQuoteAsset = (matchParams, state) => {
  const market = getMarket(matchParams, state)

  return market ? market.quoteAsset : null
}

export const getNetworkName = state => state.global.network

export const getMarketCandles = state => state.global.marketCandles

export const getPriceChartPoints = state => {
  const candles = getMarketCandles(state)
  return convertCandlesToPriceChartPoints(candles)
}

export const convertCandlesToPriceChartPoints = moize(
  (candles: ICandleWithStrings[]): IPriceChartPoint[] =>
    candles.map(moize(convertMarketCandleToDepthChartPoint))
)

export const getActivePriceChartInterval = state => state.global.priceChartInterval

export const getTokenAllowance = (symbol: string, state: any) => state.global.tokenAllowances[symbol]
export const getTokenBalance = (symbol: string, state: any) => state.global.tokenBalances[symbol]

export const getEthBalance = state => state.global.ethBalance
