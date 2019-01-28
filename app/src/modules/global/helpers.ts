import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'
import { IMarket, IMarketWithStrings } from 'types'

export const convertMarketDecimalsToNumbers = (market: IMarketWithStrings): IMarket => {
  const transformation = {
    price: toBN,
    priceEth: toBN,
    stats: {
      volume24Hours: toBN,
      ethVolume24Hours: toBN,
      percentChange24Hours: parseFloat
    }
  }

  return evolve(transformation, market) as any
}
