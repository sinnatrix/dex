import axios from 'axios'

const SET_BIDS = 'SET_BIDS'
const SET_ASKS = 'SET_ASKS'

const initialState = {
  bids: [],
  asks: []
}

export default (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_BIDS:
      return {...state, bids: payload}
    case SET_ASKS:
      return {...state, asks: payload}
    default:
      return state
  }
}

const setBids = payload => ({type: SET_BIDS, payload})
const setAsks = payload => ({type: SET_ASKS, payload})

const loadBids = ({marketplace, token}) => async dispatch => {
  const {data: bids} = await axios.get('/api/v1/orders/bids', {
    params: {
      baseTokenSymbol: marketplace,
      quoteTokenSymbol: token
    }
  })

  dispatch(setBids(bids))
}

const loadAsks = ({marketplace, token}) => async dispatch => {
  const {data: asks} = await axios.get('/api/v1/orders/asks', {
    params: {
      baseTokenSymbol: marketplace,
      quoteTokenSymbol: token
    }
  })

  dispatch(setAsks(asks))
}

export const loadOrderbook = ({marketplace, token}) => async (dispatch) => {
  await dispatch(loadBids({marketplace, token}))
  await dispatch(loadAsks({marketplace, token}))
}
