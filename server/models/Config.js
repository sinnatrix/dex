const mongoose = require('mongoose')

const Schema = mongoose.Schema

const configSchema = new Schema({
  NETWORK_ID: Number,
  INFURA_NODE_URL: String
}, {
  collection: 'config'
})

const Config = mongoose.model('Config', configSchema)

configSchema.initBasic = function () {
  const path = require('path')
  const fs = require('fs')
  const dotenv = require('dotenv')

  dotenv.config({
    path: path.resolve(process.cwd(), '.env.defaults')
  })

  const network = process.env.NETWORK || 'kovan'
  const envConfig = dotenv.parse(fs.readFileSync(`.env.${network}`))
  for (let key in envConfig) {
    process.env[key] = envConfig[key]
  }
}

configSchema.init = async function () {
  const data = await Config.findOne()
  if (!data) {
    throw new Error('no config in db!')
  }

  Object.keys(data).forEach(key => {
    if (key === '_id') {
      return
    }
    process.env[key] = data[key]
  })

  if (process.env.NETWORK === 'mainnet') {
    process.env.BLOCKCHAIN_NODE_URL = `https://mainnet.infura.io/${process.env.INFURA_KEY}`
  } else if (process.env.NETWORK === 'kovan') {
    process.env.BLOCKCHAIN_NODE_URL = `https://kovan.infura.io/${process.env.INFURA_KEY}`
  } else {
    process.env.BLOCKCHAIN_NODE_URL = process.env.TEST_RPC_URL
  }

  console.log(process.env)
}

module.exports = configSchema
