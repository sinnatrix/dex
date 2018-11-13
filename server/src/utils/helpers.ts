import { assetDataUtils } from '@0x/order-utils'
import * as R from 'ramda'
import { orderHashUtils } from '0x.js'
import { Web3Wrapper } from '@0x/web3-wrapper'
import { BigNumber } from '@0x/utils'

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
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.takerAssetData)
  const orderHash = orderHashUtils.getOrderHashHex(order)

  return {
    remainingTakerAssetAmount: order.takerAssetAmount,
    ...order,
    orderHash,
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}
