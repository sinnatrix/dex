import { Repository, EntityRepository } from 'typeorm'
import AssetEntity from '../entities/Asset'

@EntityRepository(AssetEntity)
export default class AssetRepository extends Repository<AssetEntity> {

}
