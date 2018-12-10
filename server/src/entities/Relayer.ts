import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity('relayers')
export default class Relayer {
  @PrimaryColumn('uuid')
  id: string

  @Column({ default: true })
  active: boolean

  @Column()
  name: string

  @Column()
  homepageUrl: string

  @Column({ nullable: true })
  appUrl?: string

  @Column({ nullable: true })
  logoImg?: string

  @Column({ nullable: true })
  headerImg?: string

  @Column({ nullable: true })
  sraHttpEndpoint?: string

  @Column({ nullable: true })
  sraWsEndpoint?: string

  @Column('varchar', { array: true, nullable: true })
  feeRecipientAddresses?: string[]

  @Column('varchar', { array: true, nullable: true })
  takerAddresses?: string[]
}
