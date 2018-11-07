import Token from './src/entities/Token'
import TokenPair from './src/entities/TokenPair'
import Order from './src/entities/Order'
import Relayer from './src/entities/Relayer'

const ormconfig = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
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
