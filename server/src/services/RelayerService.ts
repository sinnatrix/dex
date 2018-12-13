import * as rp from 'request-promise-native'
import RelayerEntity from '../entities/Relayer'
import { IOrderbook, IRelayerNetwork, ISRA2Orders, IHttpRelayer } from '../types'

const sift = require('sift').default

export default class RelayerService {
  networkId: number

  constructor ({ networkId }) {
    this.networkId = networkId
  }

  async loadOrderbook (relayer: IHttpRelayer, { baseAssetAddress, quoteAssetAddress }): Promise<IOrderbook> {
    if (!baseAssetAddress) {
      throw new Error('baseAssetAddress is a required parameter')
    }
    if (!quoteAssetAddress) {
      throw new Error('quoteAssetAddress is a required parameter')
    }

    const uri = `${relayer.sraHttpEndpoint}/v0/orderbook?baseAssetAddress=${baseAssetAddress}&quoteAssetAddress=${quoteAssetAddress}`

    return rp({ uri, json: true })
  }

  async loadOrders (relayer: IHttpRelayer): Promise<ISRA2Orders> {
    const uri = `${relayer.sraHttpEndpoint}orders`

    return rp({ uri, json: true })
  }
}
