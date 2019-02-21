import { IState, ISubscription } from 'types'

export const getAllSubscriptions = (state: IState): ISubscription[] => state.subscriptions.subscriptions

export const getSubscriptionByRequestId = (requestId: string, state: IState) =>
  getAllSubscriptions(state).find(one => one.requestId === requestId)

export const getSubscriptionsByListType = (listType: string, state: IState) =>
  getAllSubscriptions(state).filter(one => one.name === listType)
