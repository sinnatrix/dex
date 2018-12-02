import { EventLog } from 'web3/types'

export interface ISRA2Order {
  order: {
    makerAddress: string
    takerAddress: string,
    feeRecipientAddress: string,
    senderAddress: string,
    makerAssetAmount: string,
    takerAssetAmount: string,
    makerFee: string,
    takerFee: string,
    expirationTimeSeconds: string,
    salt: string,
    makerAssetData: string,
    takerAssetData: string,
    exchangeAddress: string,
    signature: string
  },
  metaData: {
    orderHash: string
    remainingTakerAssetAmount: string
  }
}

export interface IFillEventLog extends EventLog {
  id: string
  returnValues: {
    orderHash: string,
    senderAddress: string,
    feeRecipientAddress: string,
    makerAddress: string,
    takerAddress: string,
    makerAssetData: string,
    takerAssetData: string,
    makerAssetFilledAmount: string,
    takerAssetFilledAmount: string,
    makerFeePaid: string,
    takerFeePaid: string
  }
}
