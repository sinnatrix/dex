import * as actions from './actions'
import { wsSubscribe, wsUnsubscribe } from 'modules/subscriptions'
import { getSubscriptionsByListType, getMarketplaceToken, getCurrentToken } from 'selectors'
import { expandTradeHistory } from './helpers'

export const loadAccountTradeHistory = () => async (dispatch, getState, { apiService }) => {
  const { account } = getState().global
  const tradeHistory = await apiService.loadAccountTradeHistory(account)

  const expandedTradeHistory = tradeHistory.map(expandTradeHistory)

  dispatch(actions.setAccountTradeHistory(expandedTradeHistory))

  const [ subscription ] = getSubscriptionsByListType(getState(), 'accountTradeHistory')
  if (subscription) {
    dispatch(wsUnsubscribe(subscription.requestId))
  }

  dispatch(wsSubscribe(
    'accountTradeHistory',
    'tradeHistory',
    {
      $or: [
        { makerAddress: account },
        { takerAddress: account }
      ]
    }
  ))
}

export const loadAssetPairTradeHistory = (matchParams, page?, perPage?) => async (dispatch, getState, { apiService }) => {
  const marketplaceToken = getMarketplaceToken(matchParams, getState())
  const currentToken = getCurrentToken(matchParams, getState())

  const tradeHistory = await apiService.loadTradeHistory({
    baseAssetData: currentToken.assetData,
    quoteAssetData: marketplaceToken.assetData,
    page,
    perPage
  })

  const expandedTradeHistory = tradeHistory.map(expandTradeHistory)

  dispatch(actions.setAssetPairTradeHistory(expandedTradeHistory))

  const [ subscription ] = getSubscriptionsByListType(getState(), 'assetPairTradeHistory')
  if (subscription) {
    dispatch(wsUnsubscribe(subscription.requestId))
  }

  dispatch(wsSubscribe(
    'assetPairTradeHistory',
    'tradeHistory',
    {
      $or: [
        { makerAssetData: currentToken.assetData, takerAssetData: marketplaceToken.assetData },
        { makerAssetData: marketplaceToken.assetData, takerAssetData: currentToken.assetData }
      ]
    }
  ))
}
