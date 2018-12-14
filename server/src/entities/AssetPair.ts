import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
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
  assetA: AssetEntity

  @ManyToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetDataB' })
  assetB: AssetEntity
}
