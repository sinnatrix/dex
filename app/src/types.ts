import { BigNumber } from '@0x/utils'
import { SignedOrder, OrderInfo } from '@0x/contract-wrappers'

export interface IIndexedType<T> {
  readonly [key: string]: T
}

export interface ISRA2Order {
  order: SignedOrder
  metaData: OrderInfo
}

export interface IDexOrder extends ISRA2Order {
  extra: IDexOrderExtra
}

export interface IDexOrderWithCumulativeVolumes extends IDexOrder {
  takerVolume: BigNumber
  makerVolume: BigNumber
}

export enum OrderType {
  BID = 'bid',
  ASK = 'ask'
}

export type TOrder = OrderType.BID | OrderType.ASK

export interface IDepthChartPoint {
  type: TOrder
  price: string
  volumeSell: string
  volumeBuy: string
  showTooltip?: boolean
}

export interface IDexToken {
  id: number
  assetData: string
  address: string
  proxyId: string
  minAmount: BigNumber
  maxAmount: BigNumber
  precision: number
  decimals: number
  symbol: string
  name: string
  abi: Object
}

export interface IDexOrderExtra {
  price: BigNumber,
  makerToken: IDexToken,
  takerToken: IDexToken,
  makerAmount: BigNumber,
  takerAmount: BigNumber,
  remainingMakerAssetAmount: BigNumber,
  remainingTakerAssetAmount: BigNumber
}

type TChannel = 'orders' | 'tradeHistory'

export interface ISubscription {
  name: string
  requestId: string
  channel: TChannel
  payload: Object
}

export enum EventType {
  FILL = 'Fill',
  CANCEL = 'Cancel'
}

export interface AssetEntityWithStrings {
  assetData: string
  address: string
  proxyId: string
  minAmount: string
  maxAmount: string
  precision: number
  decimals: number
  symbol: string
  name: string
  abi?: Object
}

export interface AssetEntity {
  assetData: string
  address: string
  proxyId: string
  minAmount: BigNumber
  maxAmount: BigNumber
  precision: number
  decimals: number
  symbol: string
  name: string
  abi?: Object
}

export interface IMarketWithStrings {
  id: string
  name: string
  path: string
  baseAsset: AssetEntityWithStrings
  quoteAsset: AssetEntityWithStrings
  stats: IMarketStatsWithStrings
  price: string | null
  priceEth: string | null
  score: number
}

export interface IMarketStatsWithStrings {
  transactionCount: number
  volume24Hours: string
  percentChange24Hours: string
  ethVolume24Hours: string
}

export interface IMarket {
  id: string
  name: string
  path: string
  baseAsset: AssetEntity
  quoteAsset: AssetEntity
  stats: IMarketStats
  price: BigNumber
  priceEth: BigNumber
  score: number
}

export interface IMarketStats {
  transactionCount: number
  volume24Hours: BigNumber
  percentChange24Hours: number
  ethVolume24Hours: BigNumber
}

export interface TradeHistoryEntity {
  id: string
  event: string
  orderHash: string
  transactionHash: string
  blockNumber: number
  logIndex: number
  senderAddress: string
  feeRecipientAddress: string
  makerAddress: string
  takerAddress?: string
  makerAssetData: string
  takerAssetData: string
  makerAssetFilledAmount?: string
  takerAssetFilledAmount?: string
  makerFeePaid?: string
  takerFeePaid?: string
  timestamp: number
}

export interface ITradeHistoryItem extends TradeHistoryEntity {
  orderType: TOrder
  baseAssetData: string
  quoteAssetData: string
  baseAssetFilledAmount?: number
  quoteAssetFilledAmount?: number
  baseAssetAmount?: number
  quoteAssetAmount?: number
}

export interface IFillItem extends ITradeHistoryItem {
  event: EventType.FILL
  baseAssetFilledAmount: number
  quoteAssetFilledAmount: number
}

export interface ICancelItem extends ITradeHistoryItem {
  event: EventType.CANCEL
  baseAssetAmount: number
  quoteAssetAmount: number
}

export interface ICancelItemWithoutOrder extends ITradeHistoryItem {
  event: EventType.CANCEL
  baseAssetAmount: undefined
  quoteAssetAmount: undefined
  baseAssetFilledAmount: undefined
  quoteAssetFilledAmount: undefined
}

export interface TradeHistoryItemWithTokens extends ITradeHistoryItem {
  tokens: {
    baseToken: IDexToken,
    quoteToken: IDexToken,
    makerToken: IDexToken,
    takerToken: IDexToken
  }
}

export interface ICandleWithStrings {
  volume: string
  open: string | null
  close: string | null
  high: string | null
  low: string | null
  timestamp: number
}

export interface IPriceChartPoint {
  volume: number
  open: number | null
  close: number | null
  high: number | null
  low: number | null
  date: Date
}

/**
 * Typify State
 */
// global module state
export interface INetwork {
  id: number
  name: string
}

export interface ITokenBalances extends IIndexedType<BigNumber> {}

export interface ITokenAllowances extends IIndexedType<BigNumber> {}

export interface INormalizedStateEntities<T> {
  readonly [key: string]: IIndexedType<T>
}

export interface INormalizedState<T> {
  readonly entities: INormalizedStateEntities<T>
  readonly result: string[]
}

export interface ITokensState extends INormalizedState<IDexToken> {}

export interface IMarketsState extends INormalizedState<IMarketWithStrings> {}

export interface IPriceChartInterval {
  readonly id: string
  readonly name: string
  readonly intervalSeconds: number
  readonly groupIntervalSeconds: number
  readonly ticks: number
  readonly tickFormat: string
}

export interface IGlobalStateSection {
  readonly enabled: boolean
  readonly account: string
  readonly applicationNetwork?: INetwork
  readonly clientNetwork?: INetwork
  readonly ethBalance: BigNumber
  readonly tokenBalances: ITokenBalances
  readonly tokenAllowances: ITokenAllowances
  readonly tokens: ITokensState
  readonly markets: IMarketsState
  readonly marketLoaded: boolean
  readonly marketsLoaded: boolean
  readonly marketCandles: ICandleWithStrings[]
  readonly priceChartInterval: IPriceChartInterval
}

// orders module state
export interface IOrdersStateSection {
  readonly orderbookLoaded: boolean
  readonly orders: IIndexedType<IDexOrder>
  readonly bids: string[]
  readonly asks: string[]
  readonly accountOrders: string[]
}

// tradeHistory module state
export interface ITradeHistoryStateSection {
  readonly assetPairTradeHistoryLoaded: boolean
  readonly accountTradeHistoryLoaded: boolean
  readonly tradeHistory: IIndexedType<ITradeHistoryItem>
  readonly assetPairTradeHistory: string[]
  readonly accountTradeHistory: string[]
}

export interface ISubscriptionsStateSection {
  subscriptions: ISubscription[]
}

export interface IState {
  readonly global: IGlobalStateSection
  readonly orders: IOrdersStateSection
  readonly tradeHistory: ITradeHistoryStateSection
  readonly subscriptions: ISubscriptionsStateSection
}
