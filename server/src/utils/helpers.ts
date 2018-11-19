import { assetDataUtils } from '@0x/order-utils'
import * as R from 'ramda'

export const convertOrderToSRA2Format = order => ({
  order: R.pick([
    'makerAddress',
    'takerAddress',
    'feeRecipientAddress',
    'senderAddress',
    'makerAssetAmount',
    'takerAssetAmount',
    'makerFee',
    'takerFee',
    'expirationTimeSeconds',
    'salt',
    'makerAssetData',
    'takerAssetData',
    'exchangeAddress',
    'signature'
  ], order),
  metaData: R.pick([
    'orderHash',
    'remainingTakerAssetAmount'
  ], order)
})

export const convertOrderToDexFormat = order => {
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

export const convertTradeHistoryToDexFormat = tradeHistoryItem => {
  return {
    transactionHash: tradeHistoryItem.transactionHash,
    blockNumber: tradeHistoryItem.blockNumber,
    orderHash: tradeHistoryItem.returnValues.orderHash,
    senderAddress: tradeHistoryItem.returnValues.senderAddress.toLowerCase(),
    feeRecipientAddress: tradeHistoryItem.returnValues.feeRecipientAddress,
    makerAddress: tradeHistoryItem.returnValues.makerAddress.toLowerCase(),
    takerAddress: tradeHistoryItem.returnValues.takerAddress.toLowerCase(),
    makerAssetData: tradeHistoryItem.returnValues.makerAssetData,
    takerAssetData: tradeHistoryItem.returnValues.takerAssetData,
    makerAssetFilledAmount: tradeHistoryItem.returnValues.makerAssetFilledAmount,
    takerAssetFilledAmount: tradeHistoryItem.returnValues.takerAssetFilledAmount,
    makerFeePaid: tradeHistoryItem.returnValues.makerFeePaid,
    takerFeePaid: tradeHistoryItem.returnValues.takerFeePaid
  }
}