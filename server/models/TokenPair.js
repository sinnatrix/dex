const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenPairSchema = new Schema({
  tokenAAddress: String,
  tokenBAddress: String
}, {
  collection: 'tokenPairs'
})

module.exports = mongoose.model('TokenPair', tokenPairSchema)
