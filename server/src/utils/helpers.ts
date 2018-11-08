import { assetDataUtils } from '@0x/order-utils'
import * as R from 'ramda'
import { orderHashUtils } from '0x.js'

export const convertOrderToSRA2Format = R.pick([
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
])

export const convertOrderToDexFormat = order => {
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.takerAssetData)
  const orderHash = orderHashUtils.getOrderHashHex(order)

  return {
    ...order,
    orderHash,
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}
