const {getColl, closeConn} = require('../utils/db')
const log = require('../utils/log')
const registry = require('../api/relayerRegistry')

const mainAsync = async () => {
  const items = await registry.load()
  log.info('loaded')

  log.info({items})

  const coll = await getColl('relayers')
  await coll.remove({})
  await coll.insert(items)

  log.info('saved')

  await closeConn()
}

mainAsync().catch(console.error)
