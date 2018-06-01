require('dotenv').config()

const config = {
  INFURA_KEY: 'w9rKoIndqRSFytrOou8o',
  NETWORK_ID: parseInt(process.env.NETWORK_ID, 10),
  ATTACHED_PRIVATE_KEY: process.env.PRIVATE_KEY,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.PORT
}

module.exports = config
