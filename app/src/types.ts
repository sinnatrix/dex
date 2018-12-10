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
