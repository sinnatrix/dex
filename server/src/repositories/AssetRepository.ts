import { Repository, EntityRepository } from 'typeorm'
import AssetEntity from '../entities/Asset'

@EntityRepository(AssetEntity)
export default class AssetRepository extends Repository<AssetEntity> {
  async insertIgnore (entities: AssetEntity[]) {
    for (let entity of entities) {
      const asset = await this.findOne(entity.assetData)
      if (!asset) {
        await this.insert(entity)
      }
    }
  }
}
