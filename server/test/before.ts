import * as dotenv from 'dotenv'
const test = require('tape')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '..', '.env.test')
})

// import * as typeorm from 'typeorm'
// import ormconfig from '../ormconfig'
// import { up } from '../seeders/init-db'

test('global before', async t => {
  // const adminConn = await typeorm.createConnection({
  //   ...ormconfig,
  //   database: 'postgres',
  //   name: 'postgres',
  //   synchronize: false
  // } as any)

  // await adminConn.query(`DROP DATABASE IF EXISTS ${ormconfig.database}`)
  // await adminConn.query(`CREATE DATABASE ${ormconfig.database}`)

  // const conn = await typeorm.createConnection(ormconfig as any)

  // await up(conn)
  t.end()
})
