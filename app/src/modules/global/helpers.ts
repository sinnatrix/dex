import evolve from 'ramda/es/evolve'
import { toBN } from 'helpers/general'
import { IPriceChartPoint, ICandleWithStrings, IMarket, IMarketWithStrings } from 'types'

export const DEFAULT_MARKET_PATH = '/WETH/DAI'

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

export const convertMarketCandleToDepthChartPoint = (candle: ICandleWithStrings): IPriceChartPoint => ({
  open: candle.open ? parseFloat(candle.open) : null,
  close: candle.close ? parseFloat(candle.close) : null,
  high: candle.high ? parseFloat(candle.high) : null,
  low: candle.low ? parseFloat(candle.low) : null,
  volume: parseFloat(candle.volume),
  date: new Date(candle.timestamp * 1000)
})
