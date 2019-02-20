import { convertOrderDecimalsToBigNumber } from './helpers'
import { assetDataUtils } from '@0x/order-utils'
import { getQuoteAsset, getBaseAsset } from 'selectors'
import { BigNumber } from '@0x/utils'
import mergeWith from 'ramda/es/mergeWith'
import descend from 'ramda/es/descend'
import sort from 'ramda/es/sort'
import { AssetEntity, IDexOrder, IState } from 'types'
import moize from 'moize'

const shallowEqualArrays = require('shallow-equal/arrays')

const getPrice = (order: IDexOrder): BigNumber => new BigNumber(order.extra.price)
const getExpiration = (order: IDexOrder): string => order.order.expirationTimeSeconds.toString(10)

const byPriceAscComparator = (a: IDexOrder, b: IDexOrder) => {
  const priceA = getPrice(a)
  const priceB = getPrice(b)

  return priceA.greaterThan(priceB) ? -1 : priceA.lessThan(priceB) ? 1 : 0
}

const sortByExpirationDesc = sort(descend(getExpiration))

export const getAccountOrders = (matchParams, state: IState) =>
  sortByExpirationDesc(state.orders.accountOrders.map(hash => getOrderAsBidByHash(hash, matchParams, state)))

const getBids = (matchParams, state: IState) => state.orders.bids
  .map(hash => getOrderAsBidByHash(hash, matchParams, state))

const getAsks = (matchParams, state: IState) => state.orders.asks
  .map(hash => getOrderAsBidByHash(hash, matchParams, state))

const sortBids = bids => sort(
  byPriceAscComparator,
  bids
)

const sortAsks = asks => sort(
  byPriceAscComparator,
  asks
)

const sortBidsCached = moize(sortBids, { equals: shallowEqualArrays })

export const getOrderbookBids = (matchParams, state: IState): IDexOrder[] => {
  const baseAsset = getBaseAsset(matchParams, state)
  const quoteAsset = getQuoteAsset(matchParams, state)

  if (!baseAsset || !quoteAsset) {
    return []
  }

  return sortBidsCached(
    getBids(matchParams, state)
      .filter(one => filterOrderByAssets(one, baseAsset, quoteAsset))
  )
}

const sortAsksCached = moize(sortAsks, { equals: shallowEqualArrays })

export const getOrderbookAsks = (matchParams, state: IState): IDexOrder[] => {
  const baseAsset = getBaseAsset(matchParams, state)
  const quoteAsset = getQuoteAsset(matchParams, state)

  if (!baseAsset || !quoteAsset) {
    return []
  }

  return sortAsksCached(
    getAsks(matchParams, state)
      .filter(one => filterOrderByAssets(one, baseAsset, quoteAsset))
  )
}

const filterOrderByAssets = (order: IDexOrder, baseAsset: AssetEntity, quoteAsset: AssetEntity): boolean => {
  const { order: { makerAssetData, takerAssetData } } = order
  const baseAssetData = baseAsset.assetData
  const quoteAssetData = quoteAsset.assetData

  return (makerAssetData === baseAssetData && takerAssetData === quoteAssetData)
    ||
    (makerAssetData === quoteAssetData && takerAssetData === baseAssetData)
}

const getOrderAsBidByHash = (hash, matchParams, state: IState): IDexOrder =>
  orderAsBidCached(
    getOrderByHash(hash, state),
    getBaseAsset(matchParams, state),
    getQuoteAsset(matchParams, state)
  )

export const getOrderByHash = (hash, state: IState) => state.orders.orders[hash]

export const orderAsBid = (order, baseAsset, quoteAsset): IDexOrder => {
  const orderWithBN = convertOrderDecimalsToBigNumber(order)

  return ordersMergeDeepRightCustom(
    orderWithBN,
    getBidExtraFields(orderWithBN, baseAsset, quoteAsset)
  )
}

const orderAsBidCached = moize(orderAsBid)

const getBidExtraFields = (orderWithBN, baseAsset: AssetEntity, quoteAsset: AssetEntity) => {
  const { tokenAddress: makerAssetAddress } = assetDataUtils.decodeAssetDataOrThrow(orderWithBN.order.makerAssetData)
  const { tokenAddress: takerAssetAddress } = assetDataUtils.decodeAssetDataOrThrow(orderWithBN.order.takerAssetData)

  const makerToken = makerAssetAddress === baseAsset.address ? baseAsset : quoteAsset
  const takerToken = takerAssetAddress === baseAsset.address ? baseAsset : quoteAsset

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
  if (takerAssetAddress === baseAsset.address) {
    price = makerAmount.dividedBy(takerAmount)
  } else {
    price = takerAmount.dividedBy(makerAmount)
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

export const getOrderbookLoaded = (state: IState): boolean => state.orders.orderbookLoaded
