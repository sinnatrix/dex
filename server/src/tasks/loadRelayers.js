const runner = require('../utils/runner')
const log = require('../utils/log')
const registry = require('../api/relayerRegistry')
const Relayer = require('../models/Relayer')

runner(async () => {
  const items = await registry.load()
  log.info({ count: items.length }, 'loaded')

  await Relayer.remove({}).exec()

  await Relayer.insertMany(items)

  log.info('saved')
})
