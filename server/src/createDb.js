require('@babel/register')({
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { legacy: true }]
  ]
})

require('dotenv/config')
const typeorm = require('typeorm')
const ormconfig = require('../ormconfig')

;(async () => {
  try {
    const adminConn = await typeorm.createConnection({
      ...ormconfig,
      name: 'postgres',
      database: 'postgres',
      synchronize: false
    })

    await adminConn.query(`CREATE DATABASE ${ormconfig.database}`)

    await typeorm.createConnection(ormconfig)
  } catch (e) {
    console.error(e)
  }
  process.exit()
})()
