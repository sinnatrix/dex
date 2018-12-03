import { getTokenBySymbol } from './selectors'
import * as actions from './actions'
import { getAccount } from 'modules/global/selectors'
import { Web3Wrapper } from '@0x/web3-wrapper'

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

export const loadMarketplaceToken = symbol => async (dispatch, getState, { apiService }) => {
  const token = await apiService.getTokenBySymbol(symbol)
  dispatch(actions.setMarketplaceToken(token))
}

export const loadCurrentToken = symbol => async (dispatch, getState, { apiService }) => {
  const token = await apiService.getTokenBySymbol(symbol)
  dispatch(actions.setCurrentToken(token))
}

export const loadTokens = () => async (dispatch, getState, { apiService }) => {
  const tokens = await apiService.getTokens()
  dispatch(actions.setTokens(tokens))
}

export const loadTokenBalance = token => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const balance = await blockchainService.getTokenBalance(account, token.address)

  dispatch(actions.setTokenBalance(token.symbol, balance))
}

export const fillOrder = order => async (dispatch, getState, { blockchainService, apiService }) => {
  const account = getAccount(getState())

  const txHash = await blockchainService.fillOrderAsync(
    order.order,
    Web3Wrapper.toBaseUnitAmount(order.order.takerAssetAmount, order.extra.takerToken.decimals),
    account
  )

  if (!txHash) {
    throw new Error('txHash is invalid!')
  }

  await blockchainService.awaitTransaction(txHash)

  await apiService.refreshOrder(order.metaData.orderHash)
}

export const makeLimitOrder = ({ type, amount, price }) => async (dispatch, getState, { blockchainService, apiService }) => {
  const { marketplaceToken, currentToken, account } = getState().global

  let data

  if (type === 'buy') {
    data = {
      takerToken: currentToken,
      takerAmount: amount,
      makerToken: marketplaceToken,
      makerAmount: price.times(amount)
    }
  } else {
    data = {
      takerToken: marketplaceToken,
      takerAmount: price.times(amount),
      makerToken: currentToken,
      makerAmount: amount
    }
  }

  const signedOrder = await blockchainService.makeLimitOrderAsync(account, data)

  await apiService.createOrder(signedOrder)
}

export const makeMarketOrder = ({ type, amount }) => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const { bids, asks } = getState().subscriptions.orderbook.payload

  const ordersToCheck = (type === 'buy' ? bids : asks).map(one => one.order)

  const fillTxHash = await blockchainService.makeMarketOrderAsync(account, ordersToCheck, amount)

  console.log('fillTxHash: ', fillTxHash)
}

export const wrapEth = amount => async (dispatch, getState, { blockchainService }) => {
  const wethToken = getTokenBySymbol('WETH', getState().global)
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const { account } = getState().global

  const txHash = await blockchainService.sendWrapWethTx(account, wethToken, amount)

  await blockchainService.awaitTransaction(txHash)

  dispatch(loadTokenBalance(wethToken))

  dispatch(loadEthBalance())
}

export const unwrapWeth = amount => async (dispatch, getState, { blockchainService }) => {
  const wethToken = getTokenBySymbol('WETH', getState().global)
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const { account } = getState().global

  const txHash = await blockchainService.sendUnwrapWethTx(account, wethToken, amount)

  await blockchainService.awaitTransaction(txHash)

  dispatch(loadTokenBalance(wethToken))
  dispatch(loadEthBalance())
}
