const rp = require('request-promise-native')

class RelayerService {
  async loadOrderbook (relayer, { baseTokenAddress, quoteTokenAddress }) {
    if (!baseTokenAddress) {
      throw new Error('baseTokenAddress is a required parameter')
    }
    if (!quoteTokenAddress) {
      throw new Error('quoteTokenAddress is a required parameter')
    }

    const network = this.getNetwork(relayer)

    const uri = `${network.sra_http_endpoint}/v0/orderbook?baseTokenAddress=${baseTokenAddress}&quoteTokenAddress=${quoteTokenAddress}`
    const result = await rp({ uri, json: true })

    return result
  }

  async loadOrders (relayer) {
    const network = this.getNetwork(relayer)

    const uri = `${network.sra_http_endpoint}/v0/orders`
    const result = await rp({ uri, json: true })

    return result
  }

  async getNetwork (relayer) {
    const network = relayer.networks.find(one => one.networkId === parseInt(process.env.NETWORK_ID, 10))

    if (!network) {
      throw new Error('network unavailable')
    }

    return network
  }
}

module.exports = RelayerService
