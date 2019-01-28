import { assetDataUtils } from '@0x/order-utils'
import OrderEntity from '../entities/Order'
import TradeHistory from '../entities/TradeHistory'
import RelayerEntity from '../entities/Relayer'
import AssetPairEntity from '../entities/AssetPair'
import {
  ISRA2Order,
  ISignedOrderWithStrings,
  ICancelEventLog,
  IRelayerWithId,
  ISRA2Orders,
  IDexEventLogExtended,
  IFillEntity, ICandleWithStrings
} from '../types'
import { BigNumber } from '@0x/utils'
import { orderHashUtils } from '0x.js'
import { OrderStatus, OrderInfo, SignedOrder } from '@0x/contract-wrappers'
import { ERC20AssetData } from '@0x/types'
import * as R from 'ramda'

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const toBN = value => new BigNumber(value)
export const toString10 = (value: BigNumber) => value.toString(10)
export const toInt10 = value => parseInt(value, 10)

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
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.makerAssetData) as ERC20AssetData
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.takerAssetData) as ERC20AssetData

  const orderMetaData = {
    ...getDefaultOrderMetaData(order.order),
    ...order.metaData
  }

  return {
    // SignedOrder
    ...convertSignedOrderToSignedOrderWithStrings(order.order),
    // OrderInfo
    orderTakerAssetFilledAmount: toString10(orderMetaData.orderTakerAssetFilledAmount),
    orderHash: orderMetaData.orderHash,
    orderStatus: orderMetaData.orderStatus,
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

export const convertFillEventToDexTradeHistory = (event: IDexEventLogExtended): TradeHistory => {
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
    takerFeePaid: event.returnValues.takerFeePaid,
    timestamp: event.timestamp
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
    takerAssetData: event.returnValues.takerAssetData,
    timestamp: event.timestamp
  }
}

export const convertRelayerToDexFormat = (relayer: IRelayerWithId): RelayerEntity => {
  const network = relayer.networks[0]
  const staticOrderFields = network.static_order_fields

  return {
    id: relayer.id,
    active: true,
    name: relayer.name,
    homepageUrl: relayer.homepage_url,
    logoImg: relayer.logo_img,
    headerImg: relayer.header_img,
    sraHttpEndpoint: network.sra_http_endpoint,
    sraWsEndpoint: network.sra_ws_endpoint,
    feeRecipientAddresses: staticOrderFields
      ? staticOrderFields.fee_recipient_addresses
      : undefined,
    takerAddresses: staticOrderFields
      ? staticOrderFields.taker_addresses
      : undefined
  }
}

export const trimChars = (
  target: string,
  charsToTrim: string = ' ',
  { fromLeft = true, fromRight = true } = {}
): string => {
  const escapedChars = charsToTrim.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  const charsAsArray = escapedChars.split('')

  let pattern = ''
  if (fromLeft) {
    pattern += `^[${charsAsArray.join('')}]+`
  }

  if (fromRight) {
    pattern += (fromLeft ? '|' : '') + `[${charsAsArray.join('')}]+$`
  }

  const trimer = new RegExp(pattern, 'g')
  return target.replace(trimer, '')
}

export const getEmptyRelayerOrders = (): ISRA2Orders => ({
  total: 0,
  page: 1,
  perPage: 100,
  records: []
})

export const getNetworkNameById = (id: number): string => ({
  1: 'mainnet',
  42: 'kovan',
  50: 'test'
})[id]

export const getNowUnixtime = () => Math.round((new Date()).getTime() / 1000)

export const getFillPrice = (fillEntity: IFillEntity, assetPair: AssetPairEntity): BigNumber => {
  const quoteAsset = assetPair.assetA

  let price

  if (quoteAsset.assetData === fillEntity.makerAssetData) {
    price = new BigNumber(fillEntity.makerAssetFilledAmount)
      .dividedBy(new BigNumber(fillEntity.takerAssetFilledAmount))
  } else {
    price = new BigNumber(fillEntity.takerAssetFilledAmount)
      .dividedBy(new BigNumber(fillEntity.makerAssetFilledAmount))
  }

  return price
}

export const floorTo = base => value => Math.floor(value / base) * base

export const getEmptyCandleWithString = (timestamp?: number): ICandleWithStrings => ({
  volume: '0',
  open: null,
  close: null,
  high: null,
  low: null,
  timestamp: timestamp || (new Date()).getTime()
})
