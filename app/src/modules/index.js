import axios from 'axios'
import * as R from 'ramda'
import {BigNumber} from '@0xproject/utils'
import {ZeroEx} from '0x.js'

const SET_BIDS = 'SET_BIDS'
const SET_ASKS = 'SET_ASKS'
const SET_MARKETPLACE_TOKEN = 'SET_MARKETPLACE_TOKEN'
const SET_CURRENT_TOKEN = 'SET_CURRENT_TOKEN'

const initialState = {
  bids: [],
  asks: [],
  marketplaceToken: {},
  currentToken: {}
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
    default:
      return state
  }
}

const setBids = payload => ({type: SET_BIDS, payload})
const setAsks = payload => ({type: SET_ASKS, payload})
const setMarketplaceToken = payload => ({type: SET_MARKETPLACE_TOKEN, payload})
const setCurrentToken = payload => ({type: SET_CURRENT_TOKEN, payload})

const generateBid = ({order, baseToken, quoteToken}) => {
  const makerToken = order.makerTokenAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = order.takerTokenAddress === baseToken.address ? baseToken : quoteToken

  const decimalFields = [
    'expirationUnixTimestampSec',
    'makerFee',
    'makerTokenAmount',
    'salt',
    'takerFee',
    'takerTokenAmount'
  ]

  decimalFields.forEach(key => {
    order = {
      ...order,
      [key]: new BigNumber(order[key])
    }
  })

  const makerAmount = order.makerTokenAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = order.takerTokenAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  let price
  if (order.takerTokenAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  const bid = {
    price,
    orderHash: order.orderHash,
    makerSymbol: makerToken.symbol,
    takerSymbol: takerToken.symbol,
    makerAmount,
    takerAmount,
    expiresAt: order.expirationUnixTimestampSec
  }

  return bid
}

export const setOrderbook = ({bids: bidOrders, asks: askOrders}) => (dispatch, getState) => {
  const {marketplaceToken, currentToken} = getState()

  const bids = bidOrders.map(
    order => generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
  )
  const bidsSorted = R.sort(R.descend(R.prop('price')), bids)
  dispatch(setBids(bidsSorted))

  const asks = askOrders.map(
    order => generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
  )
  const asksSorted = R.sort(R.descend(R.prop('price')), asks)
  dispatch(setAsks(asksSorted))
}

export const addOrder = order => (dispatch, getState) => {
  const {marketplaceToken, currentToken, bids, asks} = getState()

  if (order.makerTokenAddress === currentToken.address && order.takerTokenAddress === marketplaceToken.address) {
    const bid = generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
    const bidsSorted = R.sort(R.descend(R.prop('price')), [...bids, bid])

    dispatch(setBids(bidsSorted))
  } else {
    const ask = generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
    const asksSorted = R.sort(R.descend(R.prop('price')), [...asks, ask])

    dispatch(setAsks(asksSorted))
  }
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

export const makeOrder = ({type, amount, price}) => async (dispatch, getState) => {
  const {marketplaceToken, currentToken} = getState()

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

  const makerAddress = window.web3js.eth.accounts[0]

  const networkId = parseInt(window.web3.version.network, 10)

  const zeroEx = new ZeroEx(window.web3.currentProvider, {networkId})

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

  const shouldAddPersonalMessagePrefix = window.web3.currentProvider.constructor.name === 'MetamaskInpageProvider'
  let ecSignature
  try {
    ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)
  } catch (e) {
    console.error('e: ', e)
    return
  }

  const signedOrder = {
    ...order,
    orderHash,
    ecSignature
  }

  await axios.post('/api/relayer/v0/order', signedOrder)
}
