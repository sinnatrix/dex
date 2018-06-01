const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenPair = new Schema({
  tokenAAddress: String,
  tokenBAddress: String
}, {
  collection: 'tokenPairs'
})

module.exports = mongoose.model('TokenPair', TokenPair)
