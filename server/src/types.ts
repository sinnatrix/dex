import { EventLog } from 'web3/types'
import { SignedOrder, OrderInfo } from '@0x/contract-wrappers'
import RelayerEntity from './entities/Relayer'

export interface ISRA2Order {
  order: SignedOrder
  metaData: OrderInfo
}

export interface ISignedOrderWithStrings {
  senderAddress: string
  makerAddress: string
  takerAddress: string
  makerFee: string
  takerFee: string
  makerAssetAmount: string
  takerAssetAmount: string
  makerAssetData: string
  takerAssetData: string
  salt: string
  exchangeAddress: string
  feeRecipientAddress: string
  expirationTimeSeconds: string
  signature: string
}

export interface IDexEventLog extends EventLog {
  id: string
  transactionHash: string
  blockNumber: number
  logIndex: number
  returnValues: any
  timestamp: number
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
    makerAssetFilledAmount: string
    takerAssetFilledAmount: string
    makerFeePaid: string
    takerFeePaid: string
  }
}

export interface IEventFilters {
  fromBlock?: number
  toBlock?: number | string
  filter?: Object
}

export interface ICancelEventLog extends IDexEventLog {
  returnValues: {
    makerAddress: string
    feeRecipientAddress: string
    senderAddress: string
    orderHash: string
    makerAssetData: string
    takerAssetData: string
  }
}

export enum EventType {
  FILL = 'Fill',
  CANCEL = 'Cancel'
}

export interface IRelayer {
  name: string
  homepage_url: string
  app_url?: string
  logo_img?: string
  header_img?: string
  networks: IRelayerNetwork[]
}

export interface IRelayerNetwork {
  networkId: number
  sra_ws_endpoint?: string
  sra_http_endpoint?: string
  static_order_fields?: IRelayerNetworkStaticOrderFields
}

export interface IRelayerNetworkStaticOrderFields {
  fee_recipient_addresses?: string[]
  taker_addresses?: string[]
}

export interface IRelayerWithId extends IRelayer {
  id: string
}

export interface IHttpRelayer extends RelayerEntity {
  sraHttpEndpoint: string
}

export interface IWsRelayer extends RelayerEntity {
  sraWsEndpoint: string
}

export interface ISRA2Orders {
  total: number
  page: number
  perPage: number,
  records: ISRA2Order[]
}

export interface IOrderbook {
  bids: ISRA2Orders
  asks: ISRA2Orders
}

export interface IRadarRelayAsset {
  address: string
  symbol: string
  decimals: number
  name: string
  zeroex_official: number
  active: number
  quote: number
  createDate: string
  dydx?: {}
}

export interface ISRA2AssetPair {
  assetDataA: ISRA2AssetPairAsset
  assetDataB: ISRA2AssetPairAsset
}

export interface ISRA2AssetPairAsset {
  assetData: string
  precision: number
  minAmount: string
  maxAmount: string
}
