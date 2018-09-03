const rp = require('request-promise-native')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const networkSchema = new Schema({
  networkId: Number,
  sra_http_endpoint: String,
  sra_ws_endpoint: String,
  static_order_fields: {
    fee_recipient_addresses: [String]
  }
})

const relayerSchema = new Schema({
  name: String,
  homepage_url: String,
  app_url: String,
  header_img: String,
  logo_img: String,
  networks: [networkSchema]
})

relayerSchema.methods.loadOrderbook = async function ({ baseTokenAddress, quoteTokenAddress }) {
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

relayerSchema.methods.loadOrders = async function () {
  const network = this.getNetwork()

  const uri = `${network.sra_http_endpoint}/v0/orders`
  const result = await rp({ uri, json: true })

  return result
}

relayerSchema.methods.getNetwork = function () {
  const network = this.networks.find(one => one.networkId === parseInt(process.env.NETWORK_ID, 10))

  if (!network) {
    throw new Error('network unavailable')
  }

  return network
}

module.exports = mongoose.model('Relayer', relayerSchema)
