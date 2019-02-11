import * as actions from './actions'
import { wsSubscribe, wsUnsubscribe } from 'modules/subscriptions'
import { getSubscriptionsByListType, getQuoteAsset, getBaseAsset } from 'selectors'
import { expandTradeHistory } from './helpers'

export const loadAccountTradeHistory = () => async (dispatch, getState, { apiService }) => {
  const { account } = getState().global

  dispatch(actions.setAccountTradeHistoryLoaded(false))

  const tradeHistory = await apiService.loadAccountTradeHistory(account)

  const expandedTradeHistory = tradeHistory.map(expandTradeHistory)

  dispatch(actions.setAccountTradeHistory(expandedTradeHistory))

  dispatch(actions.setAccountTradeHistoryLoaded(true))

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
  dispatch(actions.setAssetPairTradeHistoryLoaded(false))

  const baseAsset = getBaseAsset(matchParams, getState())
  const quoteAsset = getQuoteAsset(matchParams, getState())

  if (!quoteAsset || !baseAsset) {
    return
  }

  const tradeHistory = await apiService.loadTradeHistory({
    baseAssetData: baseAsset.assetData,
    quoteAssetData: quoteAsset.assetData,
    page,
    perPage
  })

  const expandedTradeHistory = tradeHistory.map(expandTradeHistory)

  dispatch(actions.setAssetPairTradeHistory(expandedTradeHistory))

  dispatch(actions.setAssetPairTradeHistoryLoaded(true))

  const [ subscription ] = getSubscriptionsByListType(getState(), 'assetPairTradeHistory')
  if (subscription) {
    dispatch(wsUnsubscribe(subscription.requestId))
  }

  dispatch(wsSubscribe(
    'assetPairTradeHistory',
    'tradeHistory',
    {
      $or: [
        { makerAssetData: baseAsset.assetData, takerAssetData: quoteAsset.assetData },
        { makerAssetData: quoteAsset.assetData, takerAssetData: baseAsset.assetData }
      ]
    }
  ))
}
