import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm'
import AssetEntity from './Asset'

@Entity('assetPairs')
export default class AssetPair {
  @PrimaryColumn()
  assetDataA: string

  @PrimaryColumn()
  assetDataB: string

  /** relations */
  @OneToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetDataA' })
  assetA: AssetEntity

  @OneToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetDataB' })
  assetB: AssetEntity
}
