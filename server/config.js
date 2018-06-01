require('dotenv').config()

const config = {
  INFURA_KEY: 'w9rKoIndqRSFytrOou8o',
  NETWORK_ID: parseInt(process.env.NETWORK_ID, 10),
  ATTACHED_PRIVATE_KEY: process.env.PRIVATE_KEY,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.PORT,
  TEST_RPC_URL: 'http://localhost:8545'
}

config.BLOCKCHAIN_NODE_URL = process.env.NODE_ENV === 'production' ? `https://kovan.infura.io/${config.INFURA_KEY}` : config.TEST_RPC_URL

module.exports = config
