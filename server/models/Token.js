const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const Token = new Schema({
  address: String,
  minAmount: String,
  maxAmount: String,
  precision: Number
})

Token.plugin(uniqueValidator)

module.exports = mongoose.model('Token', Token)
