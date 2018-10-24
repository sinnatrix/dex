import 'dotenv/config'
import { createConnection } from 'typeorm'
import ormconfig from '../ormconfig'

;(async () => {
  const adminConn = await createConnection({
    ...ormconfig,
    name: 'postgres',
    database: 'postgres',
    synchronize: false
  } as any)

  await adminConn.query(`CREATE DATABASE ${ormconfig.database}`)

  await createConnection(ormconfig as any)
})().then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit()
})
