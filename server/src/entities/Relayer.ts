import { Entity, PrimaryColumn, Column } from 'typeorm'
import { IRelayerNetwork } from '../types'

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

  @Column({ default: null })
  logoImg?: string

  @Column()
  headerImg: string

  @Column('jsonb')
  networks: IRelayerNetwork[]
}
