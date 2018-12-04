import complement from 'ramda/es/complement'
import { assetDataUtils } from '@0x/order-utils'
import { Web3Wrapper } from '@0x/web3-wrapper'
import * as actions from './actions'
import { wsSubscribe, wsUnsubscribe } from 'modules/subscriptions'
import { getSubscriptionsByListType } from '../subscriptions/selectors'
import { getAccount } from 'modules/global/selectors'

export const loadOrderbook = () => async (dispatch, getState, { apiService }) => {
  const { marketplaceToken, currentToken } = getState().global

  const baseAssetData = assetDataUtils.encodeERC20AssetData(currentToken.address)
  const quoteAssetData = assetDataUtils.encodeERC20AssetData(marketplaceToken.address)

  const data = await apiService.getOrderbook({ baseAssetData, quoteAssetData })

  dispatch(actions.setOrderbookBids(data.bids.records))
  dispatch(actions.setOrderbookAsks(data.asks.records))

  const [ subscription ] = getSubscriptionsByListType(getState(), 'orders')
  if (subscription) {
    dispatch(wsUnsubscribe(subscription.requestId))
  }

  dispatch(wsSubscribe(
    'orders',
    'orders',
    {
      $or: [
        { makerAssetData: baseAssetData, takerAssetData: quoteAssetData },
        { makerAssetData: quoteAssetData, takerAssetData: baseAssetData }
      ]
    }
  ))
}

export const addOrders = orders => async (dispatch, getState) => {
  const { marketplaceToken, currentToken } = getState().global
  const baseAssetData = assetDataUtils.encodeERC20AssetData(marketplaceToken.address)
  const quoteAssetData = assetDataUtils.encodeERC20AssetData(currentToken.address)

  const isBid = ({ order }) => order.takerAssetData === quoteAssetData &&
    order.makerAssetData === baseAssetData

  const bidsToUpdate = orders.filter(isBid)
  const asksToUpdate = orders.filter(complement(isBid))

  if (bidsToUpdate.length > 0) {
    dispatch(actions.addOrderbookBids(bidsToUpdate))
  }

  if (asksToUpdate.length > 0) {
    dispatch(actions.addOrderbookAsks(asksToUpdate))
  }

  await new Promise(resolve => setTimeout(resolve, 2000))
  dispatch(actions.resetHighlighting())
}

export const loadActiveAccountOrders = () => async (dispatch, getState, { apiService }) => {
  const account = getAccount(getState())
  const orders = await apiService.getAccountOrders(account)

  dispatch(actions.setAccountOrders(orders))

  const [ subscription ] = getSubscriptionsByListType(getState(), 'accountOrders')
  if (subscription) {
    dispatch(wsUnsubscribe(subscription.requestId))
  }

  dispatch(wsSubscribe(
    'accountOrders',
    'orders',
    {
      $or: [
        { makerAddress: account },
        { takerAddress: account }
      ]
    }
  ))
}

export const fillOrder = order => async (dispatch, getState, { blockchainService }) => {
  const account = getAccount(getState())

  const txHash = await blockchainService.fillOrderAsync(
    order.order,
    Web3Wrapper.toBaseUnitAmount(order.order.takerAssetAmount, order.extra.takerToken.decimals),
    account
  )

  if (!txHash) {
    throw new Error('txHash is invalid!')
  }

  await blockchainService.awaitTransaction(txHash)
}

export const makeLimitOrder = ({ type, amount, price }) => async (dispatch, getState, { blockchainService, apiService }) => {
  const { marketplaceToken, currentToken, account } = getState().global

  let data

  if (type === 'buy') {
    data = {
      takerToken: currentToken,
      takerAmount: amount,
      makerToken: marketplaceToken,
      makerAmount: price.times(amount)
    }
  } else {
    data = {
      takerToken: marketplaceToken,
      takerAmount: price.times(amount),
      makerToken: currentToken,
      makerAmount: amount
    }
  }

  const signedOrder = await blockchainService.makeLimitOrderAsync(account, data)

  await apiService.createOrder(signedOrder)
}

export const makeMarketOrder = ({ type, amount }) => async (dispatch, getState, { blockchainService }) => {
  const { account } = getState().global
  const { bids, asks } = getState().subscriptions.orderbook.payload

  const ordersToCheck = (type === 'buy' ? bids : asks).map(one => one.order)

  const fillTxHash = await blockchainService.makeMarketOrderAsync(account, ordersToCheck, amount)

  console.log('fillTxHash: ', fillTxHash)
}
