const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../config')
const blockchain = require('../api/blockchain')
const {ZeroEx} = require('0x.js')
const {BigNumber} = require('@0xproject/utils')

const Schema = mongoose.Schema

const Order = new Schema({
  orderHash: {
    type: String,
    index: true,
    unique: true
  },
  maker: String,
  taker: String,
  feeRecipient: String,
  makerTokenAddress: String,
  takerTokenAddress: String,
  exchangeContractAddress: String,
  salt: String,
  makerFee: String,
  takerFee: String,
  makerTokenAmount: String,
  takerTokenAmount: String,
  expirationUnixTimestampSec: String,
  ecSignature: {
    v: Number,
    r: String,
    s: String
  }
})

Order.plugin(uniqueValidator)

Order.generateOrderbook = async function ({baseTokenAddress, quoteTokenAddress}) {
  const bids = await Order.find({
    takerTokenAddress: baseTokenAddress,
    makerTokenAddress: quoteTokenAddress
  })

  const asks = await Order.find({
    takerTokenAddress: quoteTokenAddress,
    makerTokenAddress: baseTokenAddress
  })

  return {
    bids,
    asks
  }
}

Order.methods.toZeroExOrder = function () {
  const data = this.toObject()
  delete data._id
  delete data.__v

  const fields = [
    'expirationUnixTimestampSec',
    'makerFee',
    'makerTokenAmount',
    'salt',
    'takerFee',
    'takerTokenAmount'
  ]

  fields.forEach(key => {
    data[key] = new BigNumber(data[key])
  })

  return data
}

Order.methods.validateInBlockchain = async function () {
  const provider = blockchain.getProvider()

  const zeroEx = new ZeroEx(provider, {
    networkId: config.NETWORK_ID
  })

  const data = this.toZeroExOrder()

  console.log('order: ', data)

  await zeroEx.exchange.validateOrderFillableOrThrowAsync(data)
}

module.exports = mongoose.model('Order', Order)
