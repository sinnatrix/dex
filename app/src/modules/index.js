import axios from 'axios'
import * as R from 'ramda'
import {
  generateBid,
  getTokenBalance,
  getEthBalance,
  awaitTransaction,
  setUnlimitedTokenAllowanceAsync,
  getTokenAllowance,
  setZeroTokenAllowanceAsync,
  delay,
  makeLimitOrderAsync,
  makeMarketOrderAsync,
  sendUnwrapWethTx,
  sendWrapWethTx
} from '../helpers'
import { getToken } from 'selectors'

const SET_BIDS = 'SET_BIDS'
const SET_ASKS = 'SET_ASKS'
const SET_MARKETPLACE_TOKEN = 'SET_MARKETPLACE_TOKEN'
const SET_CURRENT_TOKEN = 'SET_CURRENT_TOKEN'
const SET_ACCOUNT = 'SET_ACCOUNT'
const SET_NETWORK = 'SET_NETWORK'
const SET_TOKEN_BALANCE = 'SET_TOKEN_BALANCE'
const SET_ETH_BALANCE = 'SET_ETH_BALANCE'
const SET_TOKENS = 'SET_TOKENS'
const SET_TOKEN_ALLOWANCE = 'SET_TOKEN_ALLOWANCE'

const initialState = {
  bids: [],
  asks: [],
  marketplaceToken: {},
  currentToken: {},
  account: '',
  network: '',
  ethBalance: 0,
  tokenBalances: {},
  tokenAllowances: {},
  tokens: []
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case SET_BIDS:
      return { ...state, bids: payload }
    case SET_ASKS:
      return { ...state, asks: payload }
    case SET_MARKETPLACE_TOKEN:
      return { ...state, marketplaceToken: payload }
    case SET_CURRENT_TOKEN:
      return { ...state, currentToken: payload }
    case SET_ACCOUNT:
      return { ...state, account: payload }
    case SET_NETWORK:
      return { ...state, network: payload }
    case SET_ETH_BALANCE:
      return { ...state, ethBalance: payload }
    case SET_TOKEN_BALANCE:
      return {
        ...state,
        tokenBalances: {
          ...state.tokenBalances,
          [payload.symbol]: payload.value
        }
      }
    case SET_TOKEN_ALLOWANCE:
      return {
        ...state,
        tokenAllowances: {
          ...state.tokenAllowances,
          [payload.symbol]: payload.value
        }
      }
    case SET_TOKENS:
      return { ...state, tokens: payload }
    default:
      return state
  }
}

const setBids = payload => ({ type: SET_BIDS, payload })
const setAsks = payload => ({ type: SET_ASKS, payload })
const setMarketplaceToken = payload => ({ type: SET_MARKETPLACE_TOKEN, payload })
const setCurrentToken = payload => ({ type: SET_CURRENT_TOKEN, payload })
const setTokens = payload => ({ type: SET_TOKENS, payload })
export const setAccount = payload => ({ type: SET_ACCOUNT, payload })
export const setNetwork = payload => ({ type: SET_NETWORK, payload })
const setTokenBalance = (symbol, value) => ({ type: SET_TOKEN_BALANCE, payload: { symbol, value } })
const setEthBalance = payload => ({ type: SET_ETH_BALANCE, payload })
const setTokenAllowance = (symbol, value) => ({ type: SET_TOKEN_ALLOWANCE, payload: { symbol, value } })

export const loadEthBalance = web3 => async (dispatch, getState) => {
  const { account } = getState()
  const balance = await getEthBalance(web3, account)

  dispatch(setEthBalance(balance))
}

export const loadTokenAllowance = (web3, token) => async (dispatch, getState) => {
  const { account } = getState()

  const result = await getTokenAllowance(web3, account, token.address)

  dispatch(setTokenAllowance(token.symbol, !result.isZero()))
}

export const setUnlimitedTokenAllowance = (web3, token) => async (dispatch, getState) => {
  const { account } = getState()

  await setUnlimitedTokenAllowanceAsync(web3, account, token.address)

  await dispatch(loadTokenAllowance(token))
}

export const setZeroTokenAllowance = (web3, token) => async (dispatch, getState) => {
  const { account } = getState()

  await setZeroTokenAllowanceAsync(web3, account, token.address)

  await dispatch(loadTokenAllowance(token))
}

export const resetHighlighting = () => async (dispatch, getState) => {
  await new Promise(resolve => setTimeout(resolve, 2000))

  const { bids, asks } = getState()

  dispatch(setBids(bids.map(R.dissoc('highlight'))))
  dispatch(setAsks(asks.map(R.dissoc('highlight'))))
}

export const setOrderbook = ({ bids: bidOrders, asks: askOrders }) => (dispatch, getState) => {
  const { marketplaceToken, currentToken } = getState()

  const bids = bidOrders.map(
    order => generateBid({ order, baseToken: marketplaceToken, quoteToken: currentToken })
  )
  const bidsSorted = R.sort(R.descend(R.path(['data', 'price'])), bids)
  dispatch(setBids(bidsSorted))

  const asks = askOrders.map(
    order => generateBid({ order, baseToken: marketplaceToken, quoteToken: currentToken })
  )
  const asksSorted = R.sort(R.descend(R.path(['data', 'price'])), asks)
  dispatch(setAsks(asksSorted))
}

export const addOrder = order => (dispatch, getState) => {
  const { marketplaceToken, currentToken, bids, asks } = getState()

  if (order.makerTokenAddress === currentToken.address && order.takerTokenAddress === marketplaceToken.address) {
    const bid = {
      ...generateBid({ order, baseToken: marketplaceToken, quoteToken: currentToken }),
      highlight: true
    }
    const bidsSorted = R.sort(R.descend(R.path(['data', 'price'])), [...bids, bid])

    dispatch(setBids(bidsSorted))
  } else {
    const ask = {
      ...generateBid({ order, baseToken: marketplaceToken, quoteToken: currentToken }),
      highlight: true
    }
    const asksSorted = R.sort(R.descend(R.path(['data', 'price'])), [...asks, ask])

    dispatch(setAsks(asksSorted))
  }

  dispatch(resetHighlighting())
}

export const loadOrderbook = socket => async (dispatch, getState) => {
  const { marketplaceToken, currentToken } = getState()

  const request = {
    type: 'subscribe',
    channel: 'orderbook',
    requestId: 1,
    payload: {
      baseTokenAddress: marketplaceToken.address,
      quoteTokenAddress: currentToken.address,
      snapshot: true,
      limit: 100
    }
  }

  socket.send(JSON.stringify(request))
}

export const loadMarketplaceToken = symbol => async dispatch => {
  const { data } = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setMarketplaceToken(data))
}

export const loadCurrentToken = symbol => async dispatch => {
  const { data } = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setCurrentToken(data))
}

export const loadTokens = tokens => async dispatch => {
  const { data } = await axios.get('/api/v1/tokens')
  dispatch(setTokens(data))
}

export const loadTokenBalance = (web3, token) => async (dispatch, getState) => {
  const { account } = getState()
  const balance = await getTokenBalance(web3, account, token.address)

  dispatch(setTokenBalance(token.symbol, balance))
}

export const makeLimitOrder = (web3, { type, amount, price }) => async (dispatch, getState) => {
  const { marketplaceToken, currentToken, account } = getState()

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

  const signedOrder = await makeLimitOrderAsync(web3, account, data)

  await axios.post('/api/relayer/v0/order', signedOrder)
}

export const makeMarketOrder = (web3, { type, amount }) => async (dispatch, getState) => {
  console.log('market order: ', { type, amount })
  const { bids, asks, account } = getState()

  const ordersToCheck = (type === 'buy' ? bids : asks).map(one => one.order.data)

  const fillTxHash = await makeMarketOrderAsync(web3, account, ordersToCheck, amount)

  console.log('fillTxHash: ', fillTxHash)
}

export const wrapEth = (web3, amount) => async (dispatch, getState) => {
  const wethToken = getToken('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const { account } = getState()

  const txHash = await sendWrapWethTx(web3, account, wethToken, amount)

  await awaitTransaction(txHash)

  await delay(2000)
  dispatch(loadTokenBalance(web3, wethToken))

  await delay(3000)
  dispatch(loadEthBalance())
}

export const unwrapWeth = (web3, amount) => async (dispatch, getState) => {
  const wethToken = getToken('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const { account } = getState()

  const txHash = await sendUnwrapWethTx(web3, account, wethToken, amount)

  await awaitTransaction(txHash)

  await delay(2000)
  dispatch(loadTokenBalance(web3, wethToken))

  await delay(3000)
  dispatch(loadEthBalance())
}
