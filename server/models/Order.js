const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Order = new Schema({
  maker: String
})

module.exports = mongoose.model('Order', Order)
