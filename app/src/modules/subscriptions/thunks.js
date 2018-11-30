import * as actions from './actions'
import { addAccountOrders, addOrders } from 'modules/orders'
import { addAccountTradeHistory, addAssetPairTradeHistory } from 'modules/tradeHistory'
import { getSubscriptionByRequestId } from './selectors'

const uuidv4 = require('uuid/v4')

export const wsUnsubscribe = (requestId = null) => async (dispatch, getState, { socket }) => {
  socket.send(JSON.stringify({
    type: 'unsubscribe',
    requestId
  }))

  dispatch(actions.removeSubscription({ requestId }))
}

export const wsSubscribe = (name, channel, payload) => async (dispatch, getState, { socket }) => {
  const requestId = uuidv4()

  socket.send(JSON.stringify({
    type: 'subscribe',
    channel,
    requestId,
    payload
  }))

  dispatch(actions.addSubscription({ requestId, channel, payload, name }))
}

export const processSocketMessage = message => (dispatch, getState) => {
  const data = JSON.parse(message.data)
  const { type, payload, requestId } = data

  const [subscription] = getSubscriptionByRequestId(getState(), requestId)

  if (type === 'update') {
    switch (subscription.listType) {
      case 'orders':
        dispatch(addOrders(payload))
        break

      case 'accountOrders':
        dispatch(addAccountOrders(payload))
        break

      case 'assetPairTradeHistory':
        dispatch(addAssetPairTradeHistory(payload))
        break

      case 'accountTradeHistory':
        dispatch(addAccountTradeHistory(payload))
        break

      default:
    }
  }
}
