const config = require('../config')
const rp = require('request-promise-native')

class Relayer {
  constructor (data) {
    this.data = data
  }

  async loadOrderbook (baseTokenAddress = '0xe41d2489571d322189246dafa5ebde1f4699f498', quoteTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
    const network = this.data.networks.find(one => one.networkId === config.NETWORK_ID)
    if (!network) {
      throw new Error('network unavailable')
    }
    const uri = `${network.sra_http_endpoint}/v0/orderbook?baseTokenAddress=${baseTokenAddress}&quoteTokenAddress=${quoteTokenAddress}`
    const result = await rp({
      uri
    })

    return result
  }
}

module.exports = Relayer
