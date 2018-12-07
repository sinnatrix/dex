import { assetDataUtils } from '@0x/order-utils'
import OrderEntity from '../entities/Order'
import TradeHistory from '../entities/TradeHistory'
import { ISRA2Order, IFillEventLog, ISignedOrderWithStrings, ICancelEventLog } from '../types'
import { BigNumber } from '@0x/utils'
import { orderHashUtils } from '0x.js'
import { OrderStatus, OrderInfo, SignedOrder } from '@0x/contract-wrappers'
import * as R from 'ramda'

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

export const convertDexOrderToSRA2Format = (order: OrderEntity): ISRA2Order => ({
  order: convertSignedOrderWithStringsToSignedOrder(R.pick([
    'senderAddress',
    'makerAddress',
    'takerAddress',
    'makerFee',
    'takerFee',
    'makerAssetAmount',
    'takerAssetAmount',
    'makerAssetData',
    'takerAssetData',
    'salt',
    'exchangeAddress',
    'feeRecipientAddress',
    'expirationTimeSeconds',
    'signature'
  ], order)),
  metaData: {
    orderHash: order.orderHash,
    orderStatus: order.orderStatus,
    orderTakerAssetFilledAmount: toBN(order.orderTakerAssetFilledAmount)
  }
})

export const convertOrderToDexFormat = (order: ISRA2Order): OrderEntity => {
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

export const convertFillEventToDexTradeHistory = (event: IFillEventLog): TradeHistory => {
  return {
    id: event.id,
    event: event.event,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    orderHash: event.returnValues.orderHash,
    senderAddress: event.returnValues.senderAddress.toLowerCase(),
    feeRecipientAddress: event.returnValues.feeRecipientAddress,
    makerAddress: event.returnValues.makerAddress.toLowerCase(),
    takerAddress: event.returnValues.takerAddress.toLowerCase(),
    makerAssetData: event.returnValues.makerAssetData,
    takerAssetData: event.returnValues.takerAssetData,
    makerAssetFilledAmount: event.returnValues.makerAssetFilledAmount,
    takerAssetFilledAmount: event.returnValues.takerAssetFilledAmount,
    makerFeePaid: event.returnValues.makerFeePaid,
    takerFeePaid: event.returnValues.takerFeePaid
  }
}

export const convertCancelEventToDexEventLogItem = (event: ICancelEventLog): TradeHistory => {
  return {
    id: event.id,
    event: event.event,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    orderHash: event.returnValues.orderHash,
    senderAddress: event.returnValues.senderAddress.toLowerCase(),
    feeRecipientAddress: event.returnValues.feeRecipientAddress,
    makerAddress: event.returnValues.makerAddress.toLowerCase(),
    makerAssetData: event.returnValues.makerAssetData,
    takerAssetData: event.returnValues.takerAssetData
  }
}
