const rp = require('request-promise-native')

class RelayerService {
  constructor ({ relayer }) {
    this.relayer = relayer
  }

  async loadOrderbook ({ baseTokenAddress, quoteTokenAddress }) {
    if (!baseTokenAddress) {
      throw new Error('baseTokenAddress is a required parameter')
    }
    if (!quoteTokenAddress) {
      throw new Error('quoteTokenAddress is a required parameter')
    }

    const network = this.getNetwork()

    const uri = `${network.sra_http_endpoint}/v0/orderbook?baseTokenAddress=${baseTokenAddress}&quoteTokenAddress=${quoteTokenAddress}`
    const result = await rp({ uri, json: true })

    return result
  }

  async loadOrders () {
    const network = this.getNetwork()

    const uri = `${network.sra_http_endpoint}/v0/orders`
    const result = await rp({ uri, json: true })

    return result
  }

  async getNetwork () {
    const network = this.relayer.networks.find(one => one.networkId === parseInt(process.env.NETWORK_ID, 10))

    if (!network) {
      throw new Error('network unavailable')
    }

    return network
  }
}

module.exports = RelayerService
