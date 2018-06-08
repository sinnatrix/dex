import axios from 'axios'
import * as R from 'ramda'

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

  const makerAmount = order.makerTokenAmount / Math.pow(10, makerToken.decimals)
  const takerAmount = order.takerTokenAmount / Math.pow(10, takerToken.decimals)

  let price
  if (order.takerTokenAddress === baseToken.address) {
    price = takerAmount / makerAmount
  } else {
    price = makerAmount * makerToken / takerAmount
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

export const loadOrderbook = () => async (dispatch, getState) => {
  const {marketplaceToken, currentToken} = getState()

  const {data: {bids: bidOrders, asks: askOrders}} = await axios.get('/api/relayer/v0/orderbook', {
    params: {
      baseTokenAddress: marketplaceToken.address,
      quoteTokenAddress: currentToken.address
    }
  })

  const bids = bidOrders.map(
    order => generateBid({order, baseToken: marketplaceToken, quoteToken: currentToken})
  )
  const bidsSorted = R.sort(R.descend(R.prop('price')), bids)
  dispatch(setBids(bidsSorted))

  const asks = askOrders.map(
    order => generateBid({order, baseToken: currentToken, quoteToken: marketplaceToken})
  )
  const asksSorted = R.sort(R.descend(R.prop('price')), asks)
  dispatch(setAsks(asksSorted))
}

export const loadMarketplaceToken = symbol => async dispatch => {
  const {data} = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setMarketplaceToken(data))
}

export const loadCurrentToken = symbol => async dispatch => {
  const {data} = await axios(`/api/v1/tokens/${symbol}`)
  dispatch(setCurrentToken(data))
}
