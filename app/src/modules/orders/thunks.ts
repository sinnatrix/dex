import complement from 'ramda/es/complement'
import { Web3Wrapper } from '@0x/web3-wrapper'
import * as actions from './actions'
import { wsSubscribe, wsUnsubscribe } from 'modules/subscriptions'
import {
  getAccount,
  getBaseAsset,
  getQuoteAsset,
  getSubscriptionsByListType
} from 'selectors'
import { AssetEntity, IDexOrder, ISRA2Order } from 'types'
import { BigNumber } from '@0x/utils'

export const loadOrderbook = matchParams => async (dispatch, getState) => {
  const quoteAsset = getQuoteAsset(matchParams, getState())
  const baseAsset = getBaseAsset(matchParams, getState())

  if (!quoteAsset || !baseAsset) {
    return
  }

  dispatch(actions.setOrderbookLoaded(false))

  await dispatch(loadOrderbookByAssets(baseAsset, quoteAsset))

  dispatch(actions.setOrderbookLoaded(true))
}

export const loadOrderbookByAssets = (
  baseAsset: AssetEntity,
  quoteAsset: AssetEntity
) => async (dispatch, getState, { apiService }) => {
  const data = await apiService.loadOrderbook({
    baseAssetData: baseAsset.assetData,
    quoteAssetData: quoteAsset.assetData
  })

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
        { makerAssetData: baseAsset.assetData, takerAssetData: quoteAsset.assetData },
        { makerAssetData: quoteAsset.assetData, takerAssetData: baseAsset.assetData }
      ]
    }
  ))
}

export const addOrders = (orders: ISRA2Order[], matchParams) => async (dispatch, getState) => {
  const quoteAsset = getQuoteAsset(matchParams, getState())
  const baseAsset = getBaseAsset(matchParams, getState())

  if (!quoteAsset || !baseAsset) {
    return
  }

  const isBid = ({ order }) => order.takerAssetData === quoteAsset.assetData &&
    order.makerAssetData === baseAsset.assetData

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
  const orders = await apiService.loadAccountOrders(account)

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

export const fillOrder = (
  order: IDexOrder,
  takerFillAmount?: number | string
) => async (dispatch, getState, { blockchainService }) => {
  const account = getAccount(getState())

  const amountToFill = takerFillAmount === undefined
    ? order.extra.remainingTakerAssetAmount
    : new BigNumber(takerFillAmount)

  const txHash = await blockchainService.fillOrder(
    order.order,
    Web3Wrapper.toBaseUnitAmount(
      amountToFill,
      order.extra.takerToken.decimals
    ),
    account
  )

  if (!txHash) {
    throw new Error('txHash is invalid!')
  }

  await blockchainService.awaitTransaction(txHash)
}

export const cancelOrder = (order: IDexOrder) => async (dispatch, getState, { blockchainService }) => {
  const txHash = await blockchainService.contractWrappers.exchange.cancelOrderAsync(order.order)

  if (!txHash) {
    throw new Error('txHash is invalid!')
  }

  await blockchainService.awaitTransaction(txHash)
}

export const makeLimitOrder = ({ type, amount, price, expires }, matchParams) =>
  async (dispatch, getState, { blockchainService, apiService }) => {
    const account = getAccount(getState())
    const quoteAsset = getQuoteAsset(matchParams, getState())
    const baseAsset = getBaseAsset(matchParams, getState())

    let data

    if (type === 'buy') {
      data = {
        takerToken: baseAsset,
        takerAmount: amount,
        makerToken: quoteAsset,
        makerAmount: price.times(amount),
        expires
      }
    } else {
      data = {
        takerToken: quoteAsset,
        takerAmount: price.times(amount),
        makerToken: baseAsset,
        makerAmount: amount,
        expires
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
