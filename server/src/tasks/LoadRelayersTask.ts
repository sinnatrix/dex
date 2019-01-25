import RelayerRegistryService from '../services/RelayerRegistryService'
import RelayerRepository from '../repositories/RelayerRepository'
import JobEntity from '../entities/Job'
import * as R from 'ramda'
import { convertRelayerToDexFormat } from '../utils/helpers'

export default class LoadRelayersTask {
  networkId: number
  relayerRegistryService: RelayerRegistryService
  relayerRepository: RelayerRepository

  constructor ({ networkId, relayerRepository, relayerRegistryService }) {
    this.networkId = networkId
    this.relayerRegistryService = relayerRegistryService
    this.relayerRepository = relayerRepository
  }

  async run (job: JobEntity): Promise<JobEntity> {
    const itemsWithUnderscores = await this.relayerRegistryService.loadRelayers()

    const itemsAsArray = R.values(
      R.mapObjIndexed((v, k, o) => ({
        id: k,
        ...v
      }))(itemsWithUnderscores)
    )

    const itemsForCurrentNetwork = itemsAsArray.map(relayer => ({
      ...relayer,
      networks: relayer.networks.filter(network => {
        return network.networkId === this.networkId
      })
    })).filter(relayer => relayer.networks && relayer.networks.length > 0)

    const itemsToSave = itemsForCurrentNetwork.map(convertRelayerToDexFormat)

    await this.relayerRepository.insertIgnore(itemsToSave)

    return job
  }
}
