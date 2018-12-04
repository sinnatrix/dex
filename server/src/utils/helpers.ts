import { assetDataUtils } from '@0x/order-utils'
import Order from '../entities/Order'
import TradeHistory from '../entities/TradeHistory'
import { ISRA2Order, IFillEventLog, ISignedOrderWithStrings } from '../types'
import { BigNumber } from '@0x/utils'
import { orderHashUtils } from '0x.js'
import { OrderStatus, OrderInfo, SignedOrder } from '@0x/contract-wrappers'
import * as R from 'ramda'

const toBN = value => new BigNumber(value)
const toString10 = (value: BigNumber) => value.toString(10)

const createOrderTransformation = fn => ({
  makerFee: fn,
  takerFee: fn,
  makerAssetAmount: fn,
  takerAssetAmount: fn,
  salt: fn,
  expirationTimeSeconds: fn
})

export const convertSignedOrderWithStringsToSignedOrder = (signedOrderWithStrings: ISignedOrderWithStrings): SignedOrder => {
  const transformation = createOrderTransformation(toBN)
  return R.evolve(transformation, signedOrderWithStrings)
}

export const convertSignedOrderToSignedOrderWithStrings = (signedOrder: SignedOrder): ISignedOrderWithStrings => {
  const transformation = createOrderTransformation(toString10)
  return R.evolve(transformation, signedOrder)
}

export const convertOrderToSRA2Format = (order: Order): ISRA2Order => ({
  order: convertSignedOrderWithStringsToSignedOrder(order),
  metaData: {
    orderHash: order.orderHash,
    orderStatus: order.orderStatus,
    orderTakerAssetFilledAmount: toBN(order.orderTakerAssetFilledAmount)
  }
})

export const convertOrderToDexFormat = (order: ISRA2Order): Order => {
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.takerAssetData)

  return {
    // SignedOrder
    ...convertSignedOrderToSignedOrderWithStrings(order.order),
    // OrderInfo
    orderTakerAssetFilledAmount: toString10(order.metaData.orderTakerAssetFilledAmount),
    orderHash: order.metaData.orderHash,
    orderStatus: order.metaData.orderStatus,
    // extra
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}

export const getDefaultOrderMetaData = (order: SignedOrder): OrderInfo => ({
  orderStatus: OrderStatus.FILLABLE,
  orderHash: orderHashUtils.getOrderHashHex(order),
  orderTakerAssetFilledAmount: new BigNumber(0)
})

export const convertFillEventToDexTradeHistory = (fillEvent: IFillEventLog): TradeHistory => {
  return {
    id: fillEvent.id,
    transactionHash: fillEvent.transactionHash,
    blockNumber: fillEvent.blockNumber,
    logIndex: fillEvent.logIndex,
    orderHash: fillEvent.returnValues.orderHash,
    senderAddress: fillEvent.returnValues.senderAddress.toLowerCase(),
    feeRecipientAddress: fillEvent.returnValues.feeRecipientAddress,
    makerAddress: fillEvent.returnValues.makerAddress.toLowerCase(),
    takerAddress: fillEvent.returnValues.takerAddress.toLowerCase(),
    makerAssetData: fillEvent.returnValues.makerAssetData,
    takerAssetData: fillEvent.returnValues.takerAssetData,
    makerAssetFilledAmount: fillEvent.returnValues.makerAssetFilledAmount,
    takerAssetFilledAmount: fillEvent.returnValues.takerAssetFilledAmount,
    makerFeePaid: fillEvent.returnValues.makerFeePaid,
    takerFeePaid: fillEvent.returnValues.takerFeePaid
  }
}
