import { EventLog } from 'web3/types'
import { BigNumber } from '@0x/utils'
import { SignedOrder, OrderInfo } from '@0x/contract-wrappers'

export interface ISRA2Order {
  order: SignedOrder
  metaData: OrderInfo
}

export interface IDexOrder extends ISRA2Order {
  extra: IDexOrderExtra
}

export interface IDexOrderWithCummulativeVolumes extends IDexOrder {
  takerVolume: BigNumber
  makerVolume: BigNumber
}

export type TOrder = 'bid' | 'ask'

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

export interface IDexEventLog extends EventLog {
  id: string
  transactionHash: string
  blockNumber: number
  logIndex: number
  returnValues: any
}

export interface IFillEventLogWithStrings extends IDexEventLog {
  returnValues: {
    orderHash: string
    senderAddress: string
    feeRecipientAddress: string
    makerAddress: string
    takerAddress: string
    makerAssetData: string
    takerAssetData: string
    makerAssetFilledAmount: string
    takerAssetFilledAmount: string
    makerFeePaid: string
    takerFeePaid: string
  }
}

export interface IFillEventLog extends IDexEventLog {
  returnValues: {
    orderHash: string
    senderAddress: string
    feeRecipientAddress: string
    makerAddress: string
    takerAddress: string
    makerAssetData: string
    takerAssetData: string
    makerAssetFilledAmount: BigNumber
    takerAssetFilledAmount: BigNumber
    makerFeePaid: BigNumber
    takerFeePaid: BigNumber
  }
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

interface ITokensIndexedBySymbol {
  [key: string]: IDexToken
}

interface ITokenEntities {
  tokens: ITokensIndexedBySymbol
}

export interface ITokensState {
  entities: ITokenEntities
  result: string[]
}
