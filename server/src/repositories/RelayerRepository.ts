import { Repository, EntityRepository, Not, IsNull } from 'typeorm'
import RelayerEntity from '../entities/Relayer'
import log from '../utils/log'
import { IHttpRelayer } from '../types'

@EntityRepository(RelayerEntity)
export default class RelayerRepository extends Repository<RelayerEntity> {
  async insertIgnore (entities: RelayerEntity[]) {
    for (let entity of entities) {
      const relayer = await this.findOne(entity.id)
      if (!relayer) {
        await this.save(entity)
        log.info(`New relayer ${entity.name} just added`)
      }
    }
  }

  getAllActiveWithHttpEndpoint (): Promise<IHttpRelayer[]> {
    return this.find({ active: true, sraHttpEndpoint: Not(IsNull()) }) as Promise<IHttpRelayer[]>
  }
}
