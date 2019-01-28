import { assetDataUtils } from '@0x/order-utils'
import { BigNumber } from '@0x/utils'
import { IDexToken, IMarket } from 'types'

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

export const getTokens = state => state.global.tokens.result.map(symbol =>
  getTokenBySymbol(symbol, state)
).map(token => ({
  ...token,
  assetData: assetDataUtils.encodeERC20AssetData(token.address)
}))

export const getTokenBySymbol = (symbol: string, state): IDexToken =>
  state.global.tokens.entities.tokens[symbol] || DEFAULT_TOKEN

export const findTokenByAssetData = (assetData: string, tokens: IDexToken[]): IDexToken =>
  tokens.find(token => token.assetData === assetData) || DEFAULT_TOKEN

export const getMarkets = state => state.global.markets

export const getMarket = (matchParams, state) => {
  const { baseAssetSymbol, quoteAssetSymbol } = matchParams

  return getMarkets(state).find((one: IMarket) =>
    one.baseAsset.symbol === baseAssetSymbol && one.quoteAsset.symbol === quoteAssetSymbol
  )
}

export const getBaseAsset = (matchParams, state) => getMarket(matchParams, state).baseAsset
export const getQuoteAsset = (matchParams, state) => getMarket(matchParams, state).quoteAsset

export const getNetworkName = state => state.global.network

export const getMarketCandles = (state) => {
  const candles = state.global.marketCandles
  return candles.map(one => ({
    open: parseFloat(one.open),
    close: parseFloat(one.close),
    high: parseFloat(one.high),
    low: parseFloat(one.low),
    volume: parseFloat(one.volume),
    date: new Date(one.timestamp * 1000)
  }))
}

export const getPriceChartIntervals = state => state.global.priceChart.intervals
export const getActivePriceChartInterval = state => getPriceChartIntervals(state).find(one => one.active)

export const getTokenAllowance = (symbol: string, state: any) => state.global.tokenAllowances[symbol]
export const getTokenBalance = (symbol: string, state: any) => state.global.tokenBalances[symbol]

export const getEthBalance = state => state.global.ethBalance
