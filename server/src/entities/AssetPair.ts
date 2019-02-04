import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import AssetEntity from './Asset'

@Entity('assetPairs')
export default class AssetPair {
  @PrimaryColumn()
  assetDataA: string

  @PrimaryColumn()
  assetDataB: string

  /** relations */
  @ManyToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetDataA' })
  @Index()
  assetA: AssetEntity

  @ManyToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetDataB' })
  @Index()
  assetB: AssetEntity
}
