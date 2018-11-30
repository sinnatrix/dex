import * as types from './types'

/**
 * {
    requestId: '',
    channel: '',
    payload: {},
    name: ''
  }
 * @type {Array}
 */
const initialState = []

const subscriptionsReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.ADD_SUBSCRIPTION:
      return [ ...state, payload ]

    case types.REMOVE_SUBSCRIPTION:
      return state.filter(one => one.requestId !== payload.requestId)

    default:
      return state
  }
}

export default subscriptionsReducer
