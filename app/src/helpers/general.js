import { BigNumber } from '@0x/utils'
import { assetDataUtils } from '@0x/order-utils'
import pick from 'ramda/es/pick'

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

/**
 * @param order
 * @param baseToken
 * @param quoteToken
 * @returns {{order, price: BigNumber, makerToken: *, takerToken: *, makerAmount: BigNumber, takerAmount: BigNumber}}
 */
export const generateBid = ({ order, baseToken, quoteToken }) => {
  order = convertOrderToDexFormat(order)

  const makerToken = order.makerAssetAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = order.takerAssetAddress === baseToken.address ? baseToken : quoteToken

  const decimalFields = [
    'expirationTimeSeconds',
    'makerFee',
    'makerAssetAmount',
    'salt',
    'takerFee',
    'takerAssetAmount',
    'remainingTakerAssetAmount'
  ]

  order = decimalFields.reduce((agg, key) => ({
    ...agg,
    [key]: new BigNumber(order[key])
  }), { ...order })

  const makerAmount = order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = order.takerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )
  const remainingTakerAmount = order.remainingTakerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )
  const coefficient = takerAmount.dividedBy(remainingTakerAmount)
  const remainingMakerAmount = order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  ).dividedBy(coefficient)

  let price
  if (order.takerAssetAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  return {
    order,
    price,
    makerToken,
    takerToken,
    makerAmount,
    takerAmount,
    remainingTakerAmount,
    remainingMakerAmount
  }
}

export const convertOrderToSRA2Format = order => ({
  order: pick([
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
  metaData: pick([
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
