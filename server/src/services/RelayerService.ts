import * as rp from 'request-promise-native'

class RelayerService {
  async loadOrderbook (relayer, { baseAssetAddress, quoteAssetAddress }) {
    if (!baseAssetAddress) {
      throw new Error('baseAssetAddress is a required parameter')
    }
    if (!quoteAssetAddress) {
      throw new Error('quoteAssetAddress is a required parameter')
    }

    const network = this.getNetwork(relayer)

    const uri = `${network.sra_http_endpoint}/v0/orderbook?baseAssetAddress=${baseAssetAddress}&quoteAssetAddress=${quoteAssetAddress}`
    const result = await rp({ uri, json: true })

    return result
  }

  async loadOrders (relayer) {
    const network = this.getNetwork(relayer)

    const uri = `${network.sra_http_endpoint}/v0/orders`
    const result = await rp({ uri, json: true })

    return result
  }

  getNetwork (relayer) {
    const network = relayer.networks.find(one => one.networkId === parseInt(process.env.NETWORK_ID as string, 10))

    if (!network) {
      throw new Error('network unavailable')
    }

    return network
  }
}

export default RelayerService
