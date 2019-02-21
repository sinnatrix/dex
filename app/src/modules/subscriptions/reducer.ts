import * as types from './types'
import { ISubscription, ISubscriptionsStateSection } from 'types'

const initialState: ISubscriptionsStateSection = {
  subscriptions: []
}

const subscriptionsReducer = (state: ISubscriptionsStateSection = initialState, { type, payload }) => {
  switch (type) {
    case types.ADD_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: [
          ...state.subscriptions,
          payload
        ]
      }

    case types.REMOVE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.filter(
          (one: ISubscription) => one.requestId !== payload.requestId
        )
      }

    default:
      return state
  }
}

export default subscriptionsReducer
