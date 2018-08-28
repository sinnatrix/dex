import axios from 'axios'
import * as R from 'ramda'
import {BigNumber} from '@0xproject/utils'
import {ZeroEx} from '0x.js'
import {generateBid, getTokenBalance, getEthBalance} from '../helpers'
import {getToken} from 'selectors'

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

export default (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_BIDS:
      return {...state, bids: payload}
    case SET_ASKS:
      return {...state, asks: payload}
    case SET_MARKETPLACE_TOKEN:
      return {...state, marketplaceToken: payload}
    case SET_CURRENT_TOKEN:
      return {...state, currentToken: payload}
    case SET_ACCOUNT:
      return {...state, account: payload}
    case SET_NETWORK:
      return {...state, network: payload}
    case SET_ETH_BALANCE:
      return {...state, ethBalance: payload}
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
      return {...state, tokens: payload}
    default:
      return state
  }
}

const setBids = payload => ({type: SET_BIDS, payload})
const setAsks = payload => ({type: SET_ASKS, payload})
const setMarketplaceToken = payload => ({type: SET_MARKETPLACE_TOKEN, payload})
const setCurrentToken = payload => ({type: SET_CURRENT_TOKEN, payload})
const setTokens = payload => ({type: SET_TOKENS, payload})
export const setAccount = payload => ({type: SET_ACCOUNT, payload})
export const setNetwork = payload => ({type: SET_NETWORK, payload})
const setTokenBalance = (symbol, value) => ({type: SET_TOKEN_BALANCE, payload: {symbol, value}})
const setEthBalance = payload => ({type: SET_ETH_BALANCE, payload})
const setTokenAllowance = (symbol, value) => ({type: SET_TOKEN_ALLOWANCE, payload: {symbol, value}})

const getZeroEx = async () => {
  const networkId = await window.web3js.eth.net.getId()
  const zeroEx = new ZeroEx(window.web3js.currentProvider, {networkId})
  return zeroEx
}

export const loadEthBalance = () => async (dispatch, getState) => {
  const {account} = getState()
  const balance = await getEthBalance(account)

  dispatch(setEthBalance(balance))
}

export const loadTokenAllowance = token => async (dispatch, getState) => {
  const {account} = getState()

  const zeroEx = await getZeroEx()

  const result = await zeroEx.token.getProxyAllowanceAsync(
    token.address,
    account
  )

  dispatch(setTokenAllowance(token.symbol, !result.isZero()))
}

export const setUnlimitedTokenAllowance = token => async (dispatch, getState) => {
  const {account} = getState()

  const zeroEx = await getZeroEx()

  const txHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(
    token.address,
    account
  )

  await awaitTransaction(txHash)

  delay(200)

  await dispatch(loadTokenAllowance(token))
}

export const setZeroTokenAllowance = token => async (dispatch, getState) => {
  const {account} = getState()

  const zeroEx = await getZeroEx()

  const txHash = await zeroEx.token.setProxyAllowanceAsync(
    token.address,
    account,
    new BigNumber(0)
  )

  await awaitTransaction(txHash)

  delay(200)

  await dispatch(loadTokenAllowance(token))
}

export const resetHighlighting = () => async (dispatch, getState) => {
  await new Promise(resolve => setTimeout(resolve, 2000))

  const {bids, asks} = getState()

  dispatch(setBids(bids.map(R.dissoc('highlight'))))
  dispatch(setAsks(asks.map(R.dissoc('highlight'))))
}

export const setOrderbook = ({bids: bidOrders, asks: askOrders}) => (dispatch, getState) => {
  const {marketplaceToken, currentToken} = getState()

  const bids = bidOrders.map(
    order => generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
  )
  const bidsSorted = R.sort(R.descend(R.path(['data', 'price'])), bids)
  dispatch(setBids(bidsSorted))

  const asks = askOrders.map(
    order => generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
  )
  const asksSorted = R.sort(R.descend(R.path(['data', 'price'])), asks)
  dispatch(setAsks(asksSorted))
}

export const addOrder = order => (dispatch, getState) => {
  const {marketplaceToken, currentToken, bids, asks} = getState()

  if (order.makerTokenAddress === currentToken.address && order.takerTokenAddress === marketplaceToken.address) {
    const bid = {
      ...generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken}),
      highlight: true
    }
    const bidsSorted = R.sort(R.descend(R.path(['data', 'price'])), [...bids, bid])

    dispatch(setBids(bidsSorted))
  } else {
    const ask = {
      ...generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken}),
      highlight: true
    }
    const asksSorted = R.sort(R.descend(R.path(['data', 'price'])), [...asks, ask])

    dispatch(setAsks(asksSorted))
  }

  dispatch(resetHighlighting())
}

export const loadOrderbook = () => async (dispatch, getState, {send}) => {
  const {marketplaceToken, currentToken} = getState()

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

  send(JSON.stringify(request))
}

export const loadMarketplaceToken = symbol => async dispatch => {
  const {data} = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setMarketplaceToken(data))
}

export const loadCurrentToken = symbol => async dispatch => {
  const {data} = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setCurrentToken(data))
}

export const loadTokens = tokens => async dispatch => {
  const {data} = await axios.get('/api/v1/tokens')
  dispatch(setTokens(data))
}

export const loadTokenBalance = token => async (dispatch, getState) => {
  const {account} = getState()
  const balance = await getTokenBalance(account, token.address)

  dispatch(setTokenBalance(token.symbol, balance))
}

export const makeLimitOrder = ({type, amount, price}) => async (dispatch, getState) => {
  const {marketplaceToken, currentToken, account} = getState()

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

  const makerAddress = account

  const zeroEx = await getZeroEx()

  const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress()

  const order = {
    maker: makerAddress,
    taker: ZeroEx.NULL_ADDRESS,
    feeRecipient: ZeroEx.NULL_ADDRESS,
    makerTokenAddress: data.makerToken.address,
    takerTokenAddress: data.takerToken.address,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerTokenAmount: ZeroEx.toBaseUnitAmount(data.makerAmount, data.makerToken.decimals),
    takerTokenAmount: ZeroEx.toBaseUnitAmount(data.takerAmount, data.takerToken.decimals),
    expirationUnixTimestampSec: new BigNumber(parseInt(Date.now() / 1000 + 3600 * 24, 10)) // Valid for up to a day
  }

  const orderHash = ZeroEx.getOrderHashHex(order)

  const shouldAddPersonalMessagePrefix = window.web3js.currentProvider.constructor.name === 'MetamaskInpageProvider'

  const ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)

  const signedOrder = {
    ...order,
    orderHash,
    ecSignature
  }

  await axios.post('/api/relayer/v0/order', signedOrder)
}

export const makeMarketOrder = ({type, amount}) => async (dispatch, getState) => {
  console.log('market order: ', {type, amount})
  const {bids, asks, account} = getState()

  const zeroEx = await getZeroEx()

  const ordersToCheck = (type === 'buy' ? bids : asks).map(one => one.order.data)

  const ordersToFill = []
  for (const order of ordersToCheck) {
    try {
      await zeroEx.exchange.validateOrderFillableOrThrowAsync(order)
      ordersToFill.push(order)
    } catch (e) {
      console.warn('order: ', order.orderHash, ' is not fillable')
    }
  }

  const amountToFill = ZeroEx.toBaseUnitAmount(new BigNumber(amount), 18)

  const fillTxHash = await zeroEx.exchange.fillOrdersUpToAsync(
    ordersToFill,
    amountToFill,
    true,
    account
  )

  console.log('fillTxHash: ', fillTxHash)
}

const sendTransaction = tx => {
  return new Promise((resolve, reject) => {
    window.web3js.eth.sendTransaction(tx, (err, txHash) => {
      if (err) {
        reject(err)
        return
      }
      resolve(txHash)
    })
  })
}

const awaitTransaction = async txHash => {
  const zeroEx = await getZeroEx()
  await zeroEx.awaitTransactionMinedAsync(txHash)
}

const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

export const wrapEth = amount => async (dispatch, getState) => {
  const wethToken = getToken('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const {account} = getState()

  const rawTx = {
    to: wethToken.address,
    from: account,
    value: window.web3js.utils.toWei(amount.toString()),
    gas: 21000 * 2
  }

  const txHash = await sendTransaction(rawTx)

  await awaitTransaction(txHash)

  await delay(2000)
  dispatch(loadTokenBalance(wethToken))

  await delay(3000)
  dispatch(loadEthBalance())
}

export const unwrapWeth = amount => async (dispatch, getState) => {
  const wethToken = getToken('WETH', getState())
  if (!wethToken) {
    console.error('WETH token is not found')
    return
  }

  const {account} = getState()

  const contract = new window.web3js.eth.Contract(wethToken.abi, wethToken.address)

  const rawTx = {
    from: account,
    gas: 21000 * 2
  }
  const value = window.web3js.utils.toWei(amount.toString())

  const txHash = await new Promise((resolve, reject) => {
    contract.methods.withdraw(value).send(rawTx, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      resolve(result)
    })
  })

  await awaitTransaction(txHash)

  await delay(2000)
  dispatch(loadTokenBalance(wethToken))

  await delay(3000)
  dispatch(loadEthBalance())
}
