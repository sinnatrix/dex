import * as rp from 'request-promise-native'
import { IOrderbook, ISRA2Orders, IHttpRelayer } from '../types'
import { trimChars, getEmptyRelayerOrders } from '../utils/helpers'
import log from '../utils/log'

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

    const endpoint = trimChars(relayer.sraHttpEndpoint, '/')
    const uri = `${endpoint}/orderbook?baseAssetAddress=${baseAssetAddress}&quoteAssetAddress=${quoteAssetAddress}`

    return rp({ uri, json: true })
  }

  async loadOrders (relayer: IHttpRelayer, page = 1): Promise<ISRA2Orders> {
    const endpoint = trimChars(relayer.sraHttpEndpoint, '/')
    const uri = `${endpoint}/orders`
    try {
      const result = await rp({
        uri,
        json: true,
        qs: { page }
      })

      return result
    } catch (e) {
      log.error(`Cannot load orders from relayer ${relayer.name}: ${e.message}`)
      return getEmptyRelayerOrders()
    }
  }
}
