const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const blockchain = require('../api/blockchain')
const {ZeroEx} = require('0x.js')
const {BigNumber} = require('@0xproject/utils')
const Token = require('./Token')
const R = require('ramda')

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

orderSchema.methods.toBid = function ({baseToken, quoteToken}) {
  const data = this.toObject()

  if (data.takerTokenAddress !== baseToken.address && data.makerTokenAddress !== baseToken.address) {
    throw new Error('order has to be related to baseTokenAddress')
  }

  const makerToken = data.makerTokenAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = data.takerTokenAddress === baseToken.address ? baseToken : quoteToken

  const makerAmount = data.makerTokenAmount / Math.pow(10, makerToken.decimals)
  const takerAmount = data.takerTokenAmount / Math.pow(10, takerToken.decimals)

  let price
  if (data.takerTokenAddress === baseToken.address) {
    price = takerAmount / makerAmount
  } else {
    price = makerAmount * makerToken / takerAmount
  }

  const result = {
    price,
    orderHash: data.orderHash,
    makerSymbol: makerToken.symbol,
    takerSymbol: takerToken.symbol,
    makerAmount,
    takerAmount,
    expiresAt: data.expirationUnixTimestampSec
  }

  return result
}

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
  const bids = await Order.findBids({baseTokenAddress, quoteTokenAddress})
  const asks = await Order.findAsks({baseTokenAddress, quoteTokenAddress})

  return {bids, asks}
}

Order.findBids = ({baseTokenAddress, quoteTokenAddress}) => {
  return Order.find({
    takerTokenAddress: baseTokenAddress,
    makerTokenAddress: quoteTokenAddress
  })
}

Order.findAsks = ({baseTokenAddress, quoteTokenAddress}) => {
  return Order.findBids({
    quoteTokenAddress: baseTokenAddress,
    baseTokenAddress: quoteTokenAddress
  })
}

Order.findBidsOwn = async ({baseTokenSymbol, quoteTokenSymbol}) => {
  const baseToken = await Token.findOne({symbol: baseTokenSymbol})
  const quoteToken = await Token.findOne({symbol: quoteTokenSymbol})

  // console.log('baseToken: ', baseToken)
  // console.log('quoteToken: ', quoteToken)

  const bids = await Order.findBids({
    baseTokenAddress: baseToken.address,
    quoteTokenAddress: quoteToken.address
  })

  const bidsOwn = bids.map(bid => bid.toBid({baseToken, quoteToken}))
  const bidsOwnSorted = R.sort(R.descend(R.prop('price')), bidsOwn)

  return bidsOwnSorted
}

Order.findAsksOwn = ({baseTokenSymbol, quoteTokenSymbol}) => {
  return Order.findBidsOwn({
    quoteTokenSymbol: baseTokenSymbol,
    baseTokenSymbol: quoteTokenSymbol
  })
}

module.exports = Order
