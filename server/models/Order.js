const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

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

module.exports = mongoose.model('Order', Order)
