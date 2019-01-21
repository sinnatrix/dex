import AssetEntity from './src/entities/Asset'
import AssetPairEntity from './src/entities/AssetPair'
import OrderEntity from './src/entities/Order'
import RelayerEntity from './src/entities/Relayer'
import TradeHistoryEntity from './src/entities/TradeHistory'
import JobEntity from './src/entities/Job'

const ormconfig = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  timezone: 'UTC',
  synchronize: true,
  logging: false,
  entities: [
    AssetEntity,
    AssetPairEntity,
    OrderEntity,
    RelayerEntity,
    TradeHistoryEntity,
    JobEntity
  ]
}

export default ormconfig
