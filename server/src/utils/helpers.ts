import { assetDataUtils } from '@0x/order-utils'
import Order from '../entities/Order'
import TradeHistory from '../entities/TradeHistory'
import { ISRA2Order, IFillEventLog } from '../types'

export const convertOrderToSRA2Format = (order: Order): ISRA2Order => ({
  order: {
    makerAddress: order.makerAddress,
    takerAddress: order.takerAddress,
    feeRecipientAddress: order.feeRecipientAddress,
    senderAddress: order.senderAddress,
    makerAssetAmount: order.makerAssetAmount,
    takerAssetAmount: order.takerAssetAmount,
    makerFee: order.makerFee,
    takerFee: order.takerFee,
    expirationTimeSeconds: order.expirationTimeSeconds,
    salt: order.salt,
    makerAssetData: order.makerAssetData,
    takerAssetData: order.takerAssetData,
    exchangeAddress: order.exchangeAddress,
    signature: order.signature
  },
  metaData: {
    orderHash: order.orderHash,
    remainingTakerAssetAmount: order.remainingTakerAssetAmount
  }
})

export const convertOrderToDexFormat = (order: ISRA2Order): Order => {
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.takerAssetData)

  return {
    ...order.order,
    ...order.metaData,
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}

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
