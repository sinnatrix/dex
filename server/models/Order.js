const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const blockchain = require('../api/blockchain')
const {ZeroEx} = require('0x.js')
const {BigNumber} = require('@0xproject/utils')

const Schema = mongoose.Schema

const orderSchema = new Schema({
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

orderSchema.plugin(uniqueValidator)

orderSchema.methods.toZeroExOrder = function () {
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

orderSchema.methods.validateInBlockchain = async function () {
  const provider = blockchain.getProvider()

  const zeroEx = new ZeroEx(provider, {
    networkId: parseInt(process.env.NETWORK_ID, 10)
  })

  const data = this.toZeroExOrder()

  console.log('order: ', data)

  await zeroEx.exchange.validateOrderFillableOrThrowAsync(data)
}

orderSchema.methods.fillInBlockchain = async function () {
  const provider = blockchain.getProvider()

  const zeroEx = new ZeroEx(provider, {
    networkId: parseInt(process.env.NETWORK_ID, 10)
  })

  // const data = this.toZeroExOrder()

  // Get token information
  const wethTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('WETH')
  const zrxTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('ZRX')

  // Check if either getTokenIfExistsAsync query resulted in undefined
  if (wethTokenInfo === undefined || zrxTokenInfo === undefined) {
    throw new Error('could not find token info')
  }

  // Get token contract addresses
  const WETH_ADDRESS = wethTokenInfo.address
  const ZRX_ADDRESS = zrxTokenInfo.address

  console.log('tokens: ', {WETH_ADDRESS, ZRX_ADDRESS})

  await this.validateInBlockchain()
}

const Order = mongoose.model('Order', orderSchema)

Order.generateOrderbook = async ({baseTokenAddress, quoteTokenAddress}) => {
  const bids = await Order.find({
    takerTokenAddress: baseTokenAddress,
    makerTokenAddress: quoteTokenAddress
  })
  const asks = await Order.find({
    takerTokenAddress: quoteTokenAddress,
    makerTokenAddress: baseTokenAddress
  })

  return {bids, asks}
}

module.exports = Order