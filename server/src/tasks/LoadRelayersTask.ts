import { getRepository } from 'typeorm'
import log from '../utils/log'
import Relayer from '../entities/Relayer'

class LoadRelayersTask {
  relayerRegistryService: any

  constructor ({ relayerRegistryService }) {
    this.relayerRegistryService = relayerRegistryService
  }

  async run () {
    const items = await this.relayerRegistryService.loadRelayers()
    log.info({ count: items.length }, 'loaded')

    const repository = getRepository(Relayer as any)

    await repository.clear()
    await repository.save(items)

    log.info('saved')
  }
}

export default LoadRelayersTask
