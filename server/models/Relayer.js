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

Relayer.methods.loadOrderbook = async function (baseTokenAddress = '0xe41d2489571d322189246dafa5ebde1f4699f498', quoteTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
  const network = this.networks.find(one => one.networkId === config.NETWORK_ID)

  if (!network) {
    throw new Error('network unavailable')
  }

  const uri = `${network.sra_http_endpoint}/v0/orderbook?baseTokenAddress=${baseTokenAddress}&quoteTokenAddress=${quoteTokenAddress}`
  const result = await rp({
    uri
  })

  return result
}

module.exports = mongoose.model('Relayer', Relayer)
