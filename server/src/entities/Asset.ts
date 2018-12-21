import { Column, Entity, PrimaryColumn, Unique } from 'typeorm'

@Entity('assets')
@Unique('assets_uq_address_proxyId', ['address', 'proxyId'])
export default class Asset {
  @PrimaryColumn()
  assetData: string

  @Column()
  address: string

  @Column()
  proxyId: string

  @Column()
  minAmount: string

  @Column()
  maxAmount: string

  @Column()
  precision: number

  @Column()
  decimals: number

  @Column()
  symbol: string

  @Column()
  name: string

  @Column('jsonb', { nullable: true, default: null })
  abi?: Object
}
