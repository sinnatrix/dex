import * as types from './types'
import { ISubscription } from 'types'

const initialState: ISubscription[] = []

const subscriptionsReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.ADD_SUBSCRIPTION:
      return [ ...state, payload ]

    case types.REMOVE_SUBSCRIPTION:
      return state.filter((one: ISubscription) => one.requestId !== payload.requestId)

    default:
      return state
  }
}

export default subscriptionsReducer
