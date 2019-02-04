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

    const marketPromises: Promise<IMarket>[] = topRecords.map(async record => {
      const assetPair = await this.assetPairRepository.getByAssetPairSymbolsString(record.marketId) as AssetPairEntity

      const market = await this.generateMarket(
        assetPair,
        new BigNumber(record.volume),
        record.transactionsCount
      )

      return market
    })

    return Promise.all(marketPromises)
  }

  async getMarketByAssetPair (assetPair: AssetPairEntity): Promise<IMarket> {
    const { volume, count } = await this.tradeHistoryRepository.getAssetPairVolumeAndCountForLast24Hours(assetPair)

    return this.generateMarket(
      assetPair,
      volume,
      count
    )
  }

  async generateMarket (
    assetPair,
    volume,
    transactionsCount
  ): Promise<IMarket> {
    const { assetA: quoteAsset, assetB: baseAsset } = assetPair

    const latestPrice = await this.tradeHistoryService.getAssetPairLatestPrice(assetPair)
    const latestPriceExcl24 = await this.tradeHistoryService.getAssetPairLatestPriceExcl24Hours(assetPair)

    const priceEth = latestPrice ? await this.convertPriceToEth(latestPrice, quoteAsset) : null

    let ethVolume
    if (quoteAsset.symbol === 'WETH') {
      ethVolume = volume
    } else if (priceEth) {
      ethVolume = volume.mul(priceEth)
    } else {
      ethVolume = new BigNumber(0)
    }

    let priceChange
    if (!latestPrice || !latestPriceExcl24) {
      priceChange = new BigNumber(0)
    } else {
      priceChange = latestPrice.dividedBy(latestPriceExcl24)
        .minus(new BigNumber(1))
        .mul(new BigNumber(100))
    }

    return {
      id: `${baseAsset.symbol}-${quoteAsset.symbol}`,
      name: `${baseAsset.symbol}/${quoteAsset.symbol}`,
      path: `/${baseAsset.symbol}/${quoteAsset.symbol}`,
      baseAsset,
      quoteAsset,
      stats: {
        transactionsCount,
        volume24Hours: volume.toFixed(7),
        percentChange24Hours: priceChange.toFixed(2),
        ethVolume24Hours: ethVolume.toFixed(7)
      },
      price: latestPrice ? latestPrice.toFixed(7) : null,
      priceEth: priceEth ? priceEth.toFixed(7) : null,
      score: transactionsCount
    }
  }

  async convertPriceToEth (price: BigNumber, quoteAsset: AssetEntity): Promise<BigNumber | null> {
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
