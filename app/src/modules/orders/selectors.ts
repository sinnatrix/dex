import { convertOrderDecimalsToBigNumber } from './helpers'
import { assetDataUtils } from '@0x/order-utils'
import { getQuoteAsset, getBaseAsset } from 'selectors'
import { BigNumber } from '@0x/utils'
import mergeWith from 'ramda/es/mergeWith'
import descend from 'ramda/es/descend'
import sort from 'ramda/es/sort'
import { IDexOrder } from 'types'

const getPrice = (order: IDexOrder): BigNumber => new BigNumber(order.extra.price)
const getExpiration = (order: IDexOrder): string => order.order.expirationTimeSeconds.toString(10)

const byPriceAscComparator = (a: IDexOrder, b: IDexOrder) => {
  const priceA = getPrice(a)
  const priceB = getPrice(b)

  return priceA.greaterThan(priceB) ? -1 : priceA.lessThan(priceB) ? 1 : 0
}

const sortByExpirationDesc = sort(descend(getExpiration))

export const getAccountOrders = (matchParams, state) =>
  sortByExpirationDesc(state.orders.accountOrders.map(hash => getOrderAsBidByHash(hash, matchParams, state)))

export const getOrderbookBids = (matchParams, state) => {
  return sort(
    byPriceAscComparator,
    state.orders.bids.map(hash => getOrderAsBidByHash(hash, matchParams, state))
  )
}

export const getOrderbookAsks = (matchParams, state) => {
  return sort(
    byPriceAscComparator,
    state.orders.asks.map(hash => getOrderAsBidByHash(hash, matchParams, state))
  )
}

const getOrderAsBidByHash = (hash, matchParams, state) =>
  orderAsBid(
    getOrderByHash(hash, state),
    getQuoteAsset(matchParams, state),
    getBaseAsset(matchParams, state)
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
