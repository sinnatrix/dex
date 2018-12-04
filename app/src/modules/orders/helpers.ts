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
