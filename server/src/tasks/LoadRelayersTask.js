const { getRepository } = require('typeorm')
const log = require('../utils/log')
const Relayer = require('../entities/Relayer')

class LoadRelayersTask {
  constructor ({ relayerRegistryService }) {
    this.relayerRegistryService = relayerRegistryService
  }

  async run () {
    const items = await this.relayerRegistryService.loadRelayers()
    log.info({ count: items.length }, 'loaded')

    const repository = getRepository(Relayer)

    await repository.clear()
    await repository.save(items)

    log.info('saved')
  }
}

module.exports = LoadRelayersTask
