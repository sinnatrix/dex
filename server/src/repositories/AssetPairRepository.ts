import { Repository, EntityRepository } from 'typeorm'
import AssetPairEntity from '../entities/AssetPair'

@EntityRepository(AssetPairEntity)
export default class AssetPairRepository extends Repository<AssetPairEntity> {

}
