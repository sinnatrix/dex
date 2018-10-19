const Token = require('./src/entity/Token')
const TokenPair = require('./src/entity/TokenPair')
const Order = require('./src/entity/Order')
const Relayer = require('./src/entity/Relayer')

const options = {
  type: 'postgres',
  host: process.env.PSQL_HOST,
  port: process.env.PSQL_PORT,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASSWORD,
  database: process.env.PSQL_DBNAME,
  timezone: 'UTC',
  synchronize: true,
  entities: [
    Token,
    TokenPair,
    Order,
    Relayer
  ]
}

module.exports = options
