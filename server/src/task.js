require('@babel/register')({
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { legacy: true }]
  ]
})

require('dotenv/config')
const argv = require('yargs').argv

const typeorm = require('typeorm')
const { createContainer, asValue, asClass } = require('awilix')
const log = require('./utils/log')
const ormconfig = require('../ormconfig')
const RelayerService = require('./services/RelayerService')
const BlockchainService = require('./services/BlockchainService')
const OrderBlochainService = require('./services/OrderBlockainService')

;(async () => {
  try {
    const connection = await typeorm.createConnection(ormconfig)

    const taskName = argv._[0]
    const fullTaskName = taskName[0].toUpperCase() + taskName.slice(1) + 'Task'
    const Task = require(`./tasks/${fullTaskName}.js`)

    const container = createContainer()
    container.register({
      connection: asValue(connection),
      relayerService: asClass(RelayerService).singleton(),
      blockchainService: asClass(BlockchainService).singleton(),
      orderBlockchainService: asClass(OrderBlochainService).singleton(),
      [fullTaskName]: asClass(Task).singleton()
    })

    await container.resolve(fullTaskName).run()
    process.exit()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
