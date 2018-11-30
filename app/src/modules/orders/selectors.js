import { convertOrderDecimalsToBigNumber } from './helpers'
import { getTokenByAssetData, getMarketplaceToken, getCurrentToken } from 'modules/global/selectors'
import { BigNumber } from '@0x/utils'
import mergeWith from 'ramda/es/mergeWith'
import descend from 'ramda/es/descend'
import path from 'ramda/es/path'
import sort from 'ramda/es/sort'

const getPrice = order => path(['extra', 'price'], order).toString(10)
const sortByPriceDesc = sort(descend(getPrice))

export const getAccountOrders = state =>
  state.orders.accountOrders.map(hash => getOrderAsBidByHash(hash, state))

export const getOrderbookBids = state =>
  sortByPriceDesc(state.orders.bids.map(hash => getOrderAsBidByHash(hash, state)))

export const getOrderbookAsks = state =>
  sortByPriceDesc(state.orders.asks.map(hash => getOrderAsBidByHash(hash, state)))

const getOrderAsBidByHash = (hash, state) =>
  orderAsBid(getOrderByHash(hash, state), getMarketplaceToken(state), getCurrentToken(state), state)

const getOrderByHash = (hash, state) => state.orders.orders[hash]

const orderAsBid = (order, baseToken, quoteToken, state) => {
  const orderWithBN = convertOrderDecimalsToBigNumber(order)

  return ordersMergeDeepRightCustom(
    orderWithBN,
    getBidExtraFields(orderWithBN, baseToken, quoteToken, state)
  )
}

const getBidExtraFields = (orderWithBN, baseToken, quoteToken, state) => {
  const { address: makerAssetAddress } = getTokenByAssetData(orderWithBN.order.makerAssetData, state)
  const { address: takerAssetAddress } = getTokenByAssetData(orderWithBN.order.takerAssetData, state)

  const makerToken = makerAssetAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = takerAssetAddress === baseToken.address ? baseToken : quoteToken

  const makerAmount = orderWithBN.order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = orderWithBN.order.takerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )
  const remainingTakerAssetAmount = orderWithBN.metaData.remainingTakerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  const coefficient = takerAmount.dividedBy(remainingTakerAssetAmount)

  const remainingMakerAssetAmount = orderWithBN.order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  ).dividedBy(coefficient)

  let price
  if (takerAssetAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  return {
    metaData: {
      remainingMakerAssetAmount,
      remainingTakerAssetAmount
    },
    extra: {
      price,
      makerToken,
      takerToken,
      makerAmount,
      takerAmount
    }
  }
}

const ordersMergeDeepRightCustom = (o1, o2) => {
  const fn = (l, r) => {
    if (typeof l === 'object' && !(l instanceof BigNumber) && typeof r === 'object' && !(r instanceof BigNumber)) {
      return mergeWith(fn, l, r)
    }
    return r
  }
  return mergeWith(fn, o1, o2)
}
