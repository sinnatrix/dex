import * as actions from './actions'
import { assetDataUtils } from '@0x/order-utils'
import { wsSubscribe, wsUnsubscribe } from 'modules/subscriptions'
import { getSubscriptionsByListType } from 'modules/subscriptions/selectors'
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

export const loadAssetPairTradeHistory = (page?, perPage?) => async (dispatch, getState, { apiService }) => {
  const { marketplaceToken, currentToken } = getState().global

  const baseAssetData = assetDataUtils.encodeERC20AssetData(currentToken.address)
  const quoteAssetData = assetDataUtils.encodeERC20AssetData(marketplaceToken.address)

  const tradeHistory = await apiService.loadTradeHistory({
    baseAssetData,
    quoteAssetData,
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
        { makerAssetData: baseAssetData, takerAssetData: quoteAssetData },
        { makerAssetData: quoteAssetData, takerAssetData: baseAssetData }
      ]
    }
  ))
}
