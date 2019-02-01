import AssetPairRepository from '../repositories/AssetPairRepository'
import TradeHistoryRepository from '../repositories/TradeHistoryRepository'
import TradeHistoryService from './TradeHistoryService'
import { ICandleWithStrings, IMarket } from '../types'
import AssetPairEntity from '../entities/AssetPair'
import AssetEntity from '../entities/Asset'
import { BigNumber } from '@0x/utils'
import { floorTo, getEmptyCandleWithString } from '../utils/helpers'

class MarketService {
  MARKETS_LIMIT = 20

  assetPairRepository: AssetPairRepository
  tradeHistoryRepository: TradeHistoryRepository
  tradeHistoryService: TradeHistoryService

  constructor ({
    assetPairRepository,
    tradeHistoryRepository,
    tradeHistoryService
  }) {
    this.assetPairRepository = assetPairRepository
    this.tradeHistoryRepository = tradeHistoryRepository
    this.tradeHistoryService = tradeHistoryService
  }

  async getTopMarkets (): Promise<IMarket[]> {
    const topRecords = await this.assetPairRepository.getTopRecordsByTxCount24Hours(this.MARKETS_LIMIT)

    let markets: IMarket[] = []
    for (let record of topRecords) {
      let market = await this.getMarketByAssetPairSymbols(record.marketId)
      markets.push(market)
    }

    return markets
  }

  async getMarketByAssetPair (assetPair: AssetPairEntity): Promise<IMarket> {
    const { assetA: quoteAsset, assetB: baseAsset } = assetPair

    const {
      volume,
      count
    } = await this.tradeHistoryRepository.getAssetPairVolumeAndCountForLast24Hours(assetPair)

    const latestPrice = await this.tradeHistoryService.getAssetPairLatestPrice(assetPair)
    const priceEth = latestPrice ? await this.convertPriceToEth(latestPrice, quoteAsset) : null

    const latestPriceExcl24 = await this.tradeHistoryService.getAssetPairLatestPriceExcl24Hours(assetPair)

    const ethVolume = await this.convertVolumeToEth(volume, quoteAsset, latestPrice)
    const priceChange = await this.calcPriceChange(latestPrice, latestPriceExcl24)

    const market = {
      id: `${baseAsset.symbol}-${quoteAsset.symbol}`,
      name: `${baseAsset.symbol}/${quoteAsset.symbol}`,
      path: `/${baseAsset.symbol}/${quoteAsset.symbol}`,
      baseAsset,
      quoteAsset,
      stats: {
        transactionCount: count,
        volume24Hours: volume.toFixed(7),
        percentChange24Hours: priceChange.toFixed(2),
        ethVolume24Hours: ethVolume.toFixed(7)
      },
      price: latestPrice ? latestPrice.toFixed(7) : null,
      priceEth: priceEth ? priceEth.toFixed(7) : null,
      score: 0
    }

    return {
      ...market,
      score: this.getMarketScore(market)
    }
  }

  async calcPriceChange (price1, price2): Promise<BigNumber> {
    if (!price1 || !price2) {
      return new BigNumber(0)
    }

    return price1.dividedBy(price2)
      .minus(new BigNumber(1))
      .mul(new BigNumber(100))
  }

  async convertPriceToEth (price: BigNumber | null, quoteAsset: AssetEntity): Promise<BigNumber | null> {
    if (!price) {
      return null
    }

    if (quoteAsset.symbol === 'WETH') {
      return price
    }

    const assetPair = await this.assetPairRepository.findOne(
      { assetDataA: quoteAsset.assetData },
      { relations: [ 'assetA', 'assetB' ] }
    )
    if (!assetPair) {
      throw new Error('AssetPair not found!')
    }

    const latestPrice = await this.tradeHistoryService.getAssetPairLatestPrice(assetPair)

    if (!latestPrice) {
      return null
    }

    return price.mul(latestPrice)
  }

  async convertVolumeToEth (
    volume: BigNumber,
    quoteAsset: AssetEntity,
    price: BigNumber | null
  ): Promise<BigNumber> {
    if (quoteAsset.symbol === 'WETH') {
      return volume
    }

    if (!price) {
      return new BigNumber(0)
    }

    const priceEth = await this.convertPriceToEth(price, quoteAsset)

    if (!priceEth) {
      throw new Error('Cannot convert price to ETH')
    }

    return volume.mul(priceEth)
  }

  getMarketScore (market: IMarket): number {
    return market.stats.transactionCount
  }

  async getMarketByAssetPairSymbols (assetPairSymbols: string): Promise<IMarket> {
    const [ baseAssetSymbol, quoteAssetSymbol ] = assetPairSymbols.split('-')

    const assetPair = await this.assetPairRepository.getByAssetPairSymbols(quoteAssetSymbol, baseAssetSymbol)

    if (!assetPair) {
      throw new Error('Market not found')
    }

    return this.getMarketByAssetPair(assetPair)
  }

  async getMarketCandles (
    market: IMarket,
    fromTimestamp: number,
    toTimestamp: number,
    groupIntervalSeconds: number
  ): Promise<ICandleWithStrings[]> {
    const candles = await this.tradeHistoryRepository.getMarketCandles({
      baseAssetSymbol: market.baseAsset.symbol,
      quoteAssetSymbol: market.quoteAsset.symbol,
      fromTimestamp,
      toTimestamp,
      groupIntervalSeconds
    })

    return this.normalizeCandlesByTimeline(
      candles,
      this.getTimeLine(
        fromTimestamp,
        toTimestamp,
        groupIntervalSeconds
      )
    )
  }

  getTimeLine (fromTimestamp: number, toTimestamp: number, groupIntervalSeconds: number): number[] {
    const floor = floorTo(groupIntervalSeconds)
    const start = floor(fromTimestamp)
    const end = floor(toTimestamp) + groupIntervalSeconds
    const ticks = Math.floor((end - start) / groupIntervalSeconds)
    return Array(ticks).fill(0).map((v, k) => start + groupIntervalSeconds * k)
  }

  normalizeCandlesByTimeline (candles: ICandleWithStrings[], timeLine: number[]): ICandleWithStrings[] {
    return timeLine.map(timestamp =>
      candles.find(one => one.timestamp === timestamp) || getEmptyCandleWithString(timestamp)
    )
  }
}

export default MarketService
