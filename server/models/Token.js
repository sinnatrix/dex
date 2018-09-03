const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const R = require('ramda')

const Schema = mongoose.Schema

const tokenSchema = new Schema({
  address: { type: String, required: true },
  minAmount: { type: String, required: true },
  maxAmount: { type: String, required: true },
  precision: { type: Number, required: true },
  decimals: { type: Number, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true }
})

tokenSchema.plugin(uniqueValidator)

tokenSchema.methods.toSRAObject = function () {
  return R.pick([
    'address',
    'minAmount',
    'maxAmount',
    'precision'
  ], this)
}

module.exports = mongoose.model('Token', tokenSchema)
