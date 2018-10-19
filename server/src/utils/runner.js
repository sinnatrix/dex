const typeorm = require('typeorm')
const { createContainer, asValue, asClass } = require('awilix')
const log = require('./log')
const ormconfig = require('../ormconfig')
const RelayerService = require('../services/RelayerService')
const OrderBlochainService = require('../services/OrderBlockainService')

module.exports = async task => {
  const connection = await typeorm.createConnection(ormconfig)

  const container = createContainer()
  container.register({
    connection: asValue(connection),
    relayerService: asClass(RelayerService).singleton(),
    orderBlockchainService: asClass(OrderBlochainService).singleton()
  })

  try {
    await task()
  } catch (e) {
    log.error(e)
  }
}
