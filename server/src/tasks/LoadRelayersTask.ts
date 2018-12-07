import { getRepository } from 'typeorm'
import log from '../utils/log'
import Relayer from '../entities/Relayer'
import RelayerRegistryService from '../services/RelayerRegistryService'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import RelayerRepository from '../repositories/RelayerRepository'

class LoadRelayersTask {
  relayerRegistryService: RelayerRegistryService
  relayerRepository: RelayerRepository

  constructor ({ connection, relayerRegistryService }) {
    this.relayerRegistryService = relayerRegistryService
    this.relayerRepository = connection.getCustomRepository(RelayerRepository)
  }

  async run () {
    const itemsWithUnderscores = await this.relayerRegistryService.loadRelayers()

    const itemsWithCamelCase = R.map(R_.mapKeys(R_.toCamelCase), itemsWithUnderscores)

    const itemsToSave = R.values(R.mapObjIndexed((v, id, o) => ({
      id,
      ...v
    }), itemsWithCamelCase))

    await this.relayerRepository.insertIfNotExists(itemsToSave)
  }
}

export default LoadRelayersTask
