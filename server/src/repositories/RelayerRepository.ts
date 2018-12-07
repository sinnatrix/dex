import { Repository, EntityRepository } from 'typeorm'
import RelayerEntity from '../entities/Relayer'
import { IRelayer } from '../types'
import log from '../utils/log'

@EntityRepository(RelayerEntity)
export default class RelayerRepository extends Repository<RelayerEntity> {
  async insertIfNotExists (items: IRelayer[]) {
    for (let relayer of items) {
      const existsRelayer = await this.findOne(relayer.id)
      if (!existsRelayer) {
        await this.save(relayer)
        log.info(`New relayer ${relayer.name} just added`)
      }
    }
  }
}
