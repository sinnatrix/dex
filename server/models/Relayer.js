const config = require('../config')
const rp = require('request-promise-native')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NetworkSchema = new Schema({
  networkId: Number,
  sra_http_endpoint: String,
  sra_ws_endpoint: String,
  static_order_fields: {
    fee_recipient_addresses: [String]
  }
})

const Relayer = new Schema({
  name: String,
  homepage_url: String,
  app_url: String,
  header_img: String,
  logo_img: String,
  networks: [NetworkSchema]
})

Relayer.methods.loadOrderbook = async function ({baseTokenAddress, quoteTokenAddress}) {
  if (!baseTokenAddress) {
    throw new Error('baseTokenAddress is a required parameter')
  }
  if (!quoteTokenAddress) {
    throw new Error('quoteTokenAddress is a required parameter')
  }

  const network = this.getNetwork()

  const uri = `${network.sra_http_endpoint}/v0/orderbook?baseTokenAddress=${baseTokenAddress}&quoteTokenAddress=${quoteTokenAddress}`
  const result = await rp({uri})

  return result
}

Relayer.methods.loadOrders = async function () {
  const network = this.getNetwork()

  const uri = `${network.sra_http_endpoint}/v0/orders`
  const result = await rp({uri, json: true})

  return result
}

Relayer.methods.getNetwork = function () {
  const network = this.networks.find(one => one.networkId === config.NETWORK_ID)

  if (!network) {
    throw new Error('network unavailable')
  }

  return network
}

module.exports = mongoose.model('Relayer', Relayer)
