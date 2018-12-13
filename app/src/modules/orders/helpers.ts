import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'

export const convertOrderDecimalsToBigNumber = order => {
  const transformation = {
    order: {
      expirationTimeSeconds: toBN,
      makerFee: toBN,
      makerAssetAmount: toBN,
      salt: toBN,
      takerFee: toBN,
      takerAssetAmount: toBN
    },
    metaData: {
      orderTakerAssetFilledAmount: toBN
    }
  }

  return evolve(transformation, order)
}

export const convertOrderToClipboardData = extendedSRA2Order => ({
  signedOrder: extendedSRA2Order.order,
  metadata: {
    makerToken: {
      name: extendedSRA2Order.extra.makerToken.name,
      symbol: extendedSRA2Order.extra.makerToken.symbol,
      decimals: extendedSRA2Order.extra.makerToken.decimals
    },
    takerToken: {
      name: extendedSRA2Order.extra.takerToken.name,
      symbol: extendedSRA2Order.extra.takerToken.symbol,
      decimals: extendedSRA2Order.extra.takerToken.decimals
    }
  }
})
