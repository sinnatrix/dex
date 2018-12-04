export const getAllSubscriptions = state => state.subscriptions

export const getSubscriptionByRequestId = (state, requestId) =>
  getAllSubscriptions(state).filter(one => one.requestId === requestId)[0]

export const getSubscriptionsByListType = (state, listType) =>
  getAllSubscriptions(state).filter(one => one.listType === listType)
