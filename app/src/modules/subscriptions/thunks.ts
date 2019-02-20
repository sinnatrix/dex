import * as actions from './actions'
import { addAccountOrders, addOrders } from 'modules/orders'
import { addAccountTradeHistory, addAssetPairTradeHistory } from 'modules/tradeHistory'
import { getSubscriptionByRequestId } from './selectors'

const uuidv4 = require('uuid/v4')

export const wsUnsubscribe = (requestId?: string) => async (dispatch, getState, { socketService }) => {
  socketService.send(JSON.stringify({
    type: 'unsubscribe',
    requestId
  }))

  dispatch(actions.removeSubscription({ requestId }))
}

export const wsSubscribe = (name, channel, payload) => async (dispatch, getState, { socketService }) => {
  const requestId = uuidv4()

  socketService.send(JSON.stringify({
    type: 'subscribe',
    channel,
    requestId,
    payload
  }))

  dispatch(actions.addSubscription({ requestId, channel, payload, name }))
}

export const addMessageListener = getParams => (dispatch, getState, { socketService }) => {
  socketService.addMessageListener(message => {
    dispatch(
      processSocketMessage(message, getParams())
    )
  })
}

export const processSocketMessage = (message, matchParams) => (dispatch, getState) => {
  const data = JSON.parse(message.data)
  const { type, payload, requestId } = data

  const subscription = getSubscriptionByRequestId(requestId, getState())

  if (!subscription) {
    return
  }

  if (type === 'update') {
    switch (subscription.name) {
      case 'orders':
        return dispatch(addOrders(payload, matchParams))
      case 'accountOrders':
        return dispatch(addAccountOrders(payload))
      case 'assetPairTradeHistory':
        return dispatch(addAssetPairTradeHistory(payload))
      case 'accountTradeHistory':
        return dispatch(addAccountTradeHistory(payload))
      default:
        return null
    }
  }

  return null
}
