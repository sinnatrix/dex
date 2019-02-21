import { normalize, schema } from 'normalizr'
import * as actions from './actions'
import {
  getTokens,
  getTokenBySymbol,
  getMarket,
  getTokensState
} from './selectors'
import { IMarket } from 'types'

const tokenSchema = new schema.Entity('tokens', {}, { idAttribute: 'symbol' })

const marketSchema = new schema.Entity('markets', {}, { idAttribute: 'id' })

export const loadEthBalance = () => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const balance = await blockchainService.getEthBalance(account)

  dispatch(actions.setEthBalance(balance))
}

export const loadTokenAllowance = token => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const result = await blockchainService.getTokenAllowance(account, token.address)

  dispatch(actions.setTokenAllowance(token.symbol, !result.isZero()))
}

export const makeConnectRequest = () => async (dispatch, getState, { blockchainService }) => {
  await blockchainService.enable()
  dispatch(actions.setEnabled(true))
}

export const updateAccountData = () => async (dispatch, getState, { blockchainService }) => {
  const { network, account } = getState().global

  const accounts = await blockchainService.getAccounts()
  const nextAccount = (accounts[0] || '').toLowerCase()
  const nextNetwork = await blockchainService.getNetworkName()

  if (nextAccount !== account) {
    dispatch(actions.setAccount(nextAccount))
  }

  if (nextNetwork !== network) {
    dispatch(actions.setNetwork(nextNetwork))
  }
}

export const setUnlimitedTokenAllowance = token => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global

  await blockchainService.setUnlimitedTokenAllowanceAsync(account, token.address)

  await dispatch(loadTokenAllowance(token))
}

export const setZeroTokenAllowance = token => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global

  await blockchainService.setZeroTokenAllowanceAsync(account, token.address)

  await dispatch(loadTokenAllowance(token))
}

export const loadTokens = () => async (dispatch, getState, { apiService }) => {
  const tokens = await apiService.loadTokens()

  const normalized = normalize(
    tokens,
    [tokenSchema]
  )

  dispatch(actions.mergeTokens(normalized))
  await dispatch(loadTokenBalances())
}

export const loadTokenBalances = () => async (dispatch, getState) => {
  const tokens = getTokens(getTokensState(getState()))

  await Promise.all(
    tokens.map(token =>
      dispatch(loadTokenBalance(token))
    )
  )
}

export const loadTokenBalance = token => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const balance = await blockchainService.getTokenBalance(account, token.address)

  dispatch(actions.setTokenBalance(token.symbol, balance))
}

export const wrapEth = amount => async (dispatch, getState, { blockchainService }) => {
  const wethToken = getTokenBySymbol('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  if (!amount) {
    console.error('Incorrect ETH amount to wrap')
    return
  }

  const { account } = getState().global

  const txHash = await blockchainService.sendWrapWethTx(account, wethToken, amount)

  await blockchainService.awaitTransaction(txHash)

  dispatch(loadTokenBalance(wethToken))

  dispatch(loadEthBalance())
}

export const unwrapWeth = amount => async (dispatch, getState, { blockchainService }) => {
  const wethToken = getTokenBySymbol('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  if (!amount) {
    console.error('Incorrect WETH amount to unwrap')
    return
  }

  const { account } = getState().global

  const txHash = await blockchainService.sendUnwrapWethTx(account, wethToken, amount)

  await blockchainService.awaitTransaction(txHash)

  dispatch(loadTokenBalance(wethToken))
  dispatch(loadEthBalance())
}

export const loadMarkets = () => async (dispatch, getState, { apiService }) => {
  const markets = await apiService.loadMarkets()

  const normalized = normalize(
    markets,
    [marketSchema]
  )

  dispatch(actions.mergeMarkets(normalized))
}

export const loadMarket = matchParams => async (dispatch, getState, { apiService }) => {
  const { baseAssetSymbol, quoteAssetSymbol } = matchParams
  const marketId = `${baseAssetSymbol}-${quoteAssetSymbol}`
  const market = await apiService.loadMarket(marketId)

  dispatch(actions.addMarket(market))
}

export const loadMarketCandles = (market: IMarket, fromTimestamp, toTimestamp, groupIntervalSeconds) =>
  async (dispatch, getState, { apiService }) => {
    const candles = await apiService.loadMarketCandles(
      market.id,
      {
        fromTimestamp,
        toTimestamp,
        groupIntervalSeconds
      }
    )

    dispatch(actions.setMarketCandles(candles))
  }

export const changePriceChartInterval = (matchParams, interval: any) => async (dispatch, getState) => {
  const market = getMarket(matchParams, getState())

  if (!market) {
    return
  }

  dispatch(actions.setPriceChartInterval(interval))

  const now = Math.round((new Date()).getTime() / 1000)

  dispatch(loadMarketCandles(market, now - interval.intervalSeconds, now, interval.groupIntervalSeconds))
}
