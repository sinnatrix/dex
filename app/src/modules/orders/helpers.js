import { toBN } from 'helpers/general'
import evolve from 'ramda/es/evolve'

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
