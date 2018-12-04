import { convertOrderDecimalsToBigNumber } from './helpers'
import { assetDataUtils } from '@0x/order-utils'
import { getMarketplaceToken, getCurrentToken } from 'modules/global/selectors'
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
  orderAsBid(
    getOrderByHash(hash, state),
    getMarketplaceToken(state),
    getCurrentToken(state)
  )

export const getOrderByHash = (hash, state) => state.orders.orders[hash]

export const orderAsBid = (order, baseToken, quoteToken) => {
  const orderWithBN = convertOrderDecimalsToBigNumber(order)

  return ordersMergeDeepRightCustom(
    orderWithBN,
    getBidExtraFields(orderWithBN, baseToken, quoteToken)
  )
}

const getBidExtraFields = (orderWithBN, baseToken, quoteToken) => {
  const { tokenAddress: makerAssetAddress } = assetDataUtils.decodeAssetDataOrThrow(orderWithBN.order.makerAssetData)
  const { tokenAddress: takerAssetAddress } = assetDataUtils.decodeAssetDataOrThrow(orderWithBN.order.takerAssetData)

  const makerToken = makerAssetAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = takerAssetAddress === baseToken.address ? baseToken : quoteToken

  const makerAmount = orderWithBN.order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = orderWithBN.order.takerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )
  const orderTakerAssetFilledAmount = orderWithBN.metaData.orderTakerAssetFilledAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  const remainingTakerAssetAmount = takerAmount.minus(orderTakerAssetFilledAmount)

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
    extra: {
      price,
      makerToken,
      takerToken,
      makerAmount,
      takerAmount,
      remainingMakerAssetAmount,
      remainingTakerAssetAmount
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

export const convertOrderToClipboardData = extendedSRA2Order => ({
  signedOrder: extendedSRA2Order.order,
  metadata: {
    makerToken: {
      name: extendedSRA2Order.extra.makerToken.name,
      symbol: extendedSRA2Order.extra.makerToken.symbol,
      decimals: extendedSRA2Order.extra.makerToken.decimals
    },
    takerToken: {
      name: extendedSRA2Order.extra.takerToken.name,
      symbol: extendedSRA2Order.extra.takerToken.symbol,
      decimals: extendedSRA2Order.extra.takerToken.decimals
    }
  }
})
