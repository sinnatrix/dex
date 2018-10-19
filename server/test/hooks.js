const typeorm = require('typeorm')
const ormconfig = require('../ormconfig')
const initDbSeeder = require('../seeders/init-db')

before('global before', async function () {
  try {
    const adminConn = await typeorm.createConnection({
      ...ormconfig,
      database: 'postgres',
      synchronize: false
    })

    await adminConn.query(`DROP DATABASE IF EXISTS ${ormconfig.database}`)
    await adminConn.query(`CREATE DATABASE ${ormconfig.database}`)

    const conn = await typeorm.createConnection({
      ...ormconfig,
      name: 'db'
    })

    await initDbSeeder.up(conn)
  } catch (e) {
    console.error(e)
  }
})

after('global after', async () => {
  process.exit()
})
