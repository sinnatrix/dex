const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const R = require('ramda')

const Schema = mongoose.Schema

const Token = new Schema({
  address: {type: String, required: true},
  minAmount: {type: String, required: true},
  maxAmount: {type: String, required: true},
  precision: {type: Number, required: true},
  symbol: String,
  name: String
})

Token.plugin(uniqueValidator)

Token.methods.toSRAObject = function () {
  return R.pick([
    'address',
    'minAmount',
    'maxAmount',
    'precision'
  ], this)
}

module.exports = mongoose.model('Token', Token)
