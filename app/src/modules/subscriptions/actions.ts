import * as types from './types'

export const addSubscription = payload => ({ type: types.ADD_SUBSCRIPTION, payload })
export const removeSubscription = payload => ({ type: types.REMOVE_SUBSCRIPTION, payload })
