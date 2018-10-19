require('dotenv/config')

const typeorm = require('typeorm')
const ormconfig = require('../ormconfig')
const initDbSeeder = require('../seeders/init-db')

;(async () => {
  const conn = await typeorm.createConnection({
    ...ormconfig,
    name: 'db'
  })

  await initDbSeeder.up(conn)

  process.exit()
})()
