import AssetPairRepository from '../repositories/AssetPairRepository'
import TradeHistoryService from './TradeHistoryService'
import { IFillEntity, IMarket } from '../types'
import AssetPairEntity from '../entities/AssetPair'
import AssetEntity from '../entities/Asset'
import { BigNumber } from '@0x/utils'
import * as R from 'ramda'

class MarketService {
  MARKETS_LIMIT = 20

  assetPairRepository: AssetPairRepository
  tradeHistoryService: TradeHistoryService

  constructor ({ assetPairRepository, tradeHistoryService }) {
    this.assetPairRepository = assetPairRepository
    this.tradeHistoryService = tradeHistoryService
  }

  async getMarkets (): Promise<IMarket[]> {
    const assetPairsWithAssets = await this.assetPairRepository.getAllWithAssets()

    let markets: IMarket[] = []
    for (let assetPair of assetPairsWithAssets) {
      let market = await this.getMarketFromAssetPair(assetPair)
      markets.push(market)
    }

    const sorter = R.descend(R.prop('score'))

    return R.slice(0, this.MARKETS_LIMIT, R.sort(sorter, markets))
  }

  async getMarketFromAssetPair (assetPair: AssetPairEntity): Promise<IMarket> {
    const { assetA: quoteAsset, assetB: baseAsset } = assetPair

    const [records24Hours, count24Hours] = await this.tradeHistoryService
      .tradeHistoryRepository.getAssetPairRecordsAndCountForLast24Hours(assetPair)

    const volume24Hours = this.getAssetPairVolume24Hours(assetPair, records24Hours)
    const price = await this.tradeHistoryService.getAssetPairLatestPrice(assetPair)
    const priceEth = price ? await this.convertPriceToEth(price, quoteAsset) : null

    const market = {
      id: `${baseAsset.symbol}-${quoteAsset.symbol}`,
      name: `${baseAsset.symbol}/${quoteAsset.symbol}`,
      path: `/${baseAsset.symbol}/${quoteAsset.symbol}`,
      baseAsset,
      quoteAsset,
      stats: {
        transactionCount: count24Hours,
        volume24Hours: volume24Hours.toFixed(7),
        percentChange24Hours: (await this.getAssetPairPercentChange24Hours(assetPair)).toFixed(2),
        ethVolume24Hours: (await this.convertVolumeToEth(volume24Hours, quoteAsset, price)).toFixed(7)
      },
      price: price ? price.toFixed(7) : null,
      priceEth: priceEth ? priceEth.toFixed(7) : null,
      score: 0
    }

    return {
      ...market,
      score: this.getMarketScore(market)
    }
  }

  getAssetPairVolume24Hours (assetPair: AssetPairEntity, fillEntities: IFillEntity[]): BigNumber {
    let volume = new BigNumber(0)

    for (let fillEntity of fillEntities) {
      let assetFilledAmount = fillEntity.makerAssetData === assetPair.assetDataA
        ? fillEntity.makerAssetFilledAmount
        : fillEntity.takerAssetFilledAmount

      volume = volume.plus(new BigNumber(assetFilledAmount))
    }

    return volume
  }

  async getAssetPairPercentChange24Hours (assetPair: AssetPairEntity): Promise<BigNumber> {
    const latestPrice = await this.tradeHistoryService.getAssetPairLatestPrice(assetPair)
    const latestPriceExcl24 = await this.tradeHistoryService.getAssetPairLatestPriceExcl24Hours(assetPair)

    if (!latestPrice || !latestPriceExcl24) {
      return new BigNumber(0)
    }

    return latestPrice.dividedBy(latestPriceExcl24)
      .minus(new BigNumber(1))
      .mul(new BigNumber(100))
  }

  async convertPriceToEth (price: BigNumber | null, quoteAsset: AssetEntity): Promise<BigNumber | null> {
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

    if (!price || !latestPrice) {
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
}

export default MarketService
