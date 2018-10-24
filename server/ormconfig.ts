import Token from './src/entities/Token'
import TokenPair from './src/entities/TokenPair'
import Order from './src/entities/Order'
import Relayer from './src/entities/Relayer'

const ormconfig = {
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

export default ormconfig
