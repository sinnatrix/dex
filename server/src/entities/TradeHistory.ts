import { Entity, PrimaryColumn, Column, Unique, Index } from 'typeorm'

@Entity('tradeHistory')
@Unique('tradeHistory_uq_blockNumber_logIndex', ['blockNumber', 'logIndex'])
@Index(['makerAssetData', 'timestamp'])
@Index(['takerAssetData', 'timestamp'])
@Index(['makerAssetData', 'takerAssetData'])
@Index('makerAssetData_takerAssetData_timestamp', ['makerAssetData', 'takerAssetData', 'timestamp'])
@Index('takerAssetData_makerAssetData_timestamp', ['takerAssetData', 'makerAssetData', 'timestamp'])
export default class TradeHistory {
  @PrimaryColumn()
  id: string

  @Column()
  @Index()
  event: string

  @Column()
  @Index()
  orderHash: string

  @Column()
  @Index()
  transactionHash: string

  @Column('bigint')
  @Index()
  blockNumber: number

  @Column('bigint')
  logIndex: number

  @Column()
  senderAddress: string

  @Column()
  feeRecipientAddress: string

  @Column()
  makerAddress: string

  @Column({ nullable: true })
  takerAddress?: string

  @Column()
  @Index()
  makerAssetData: string

  @Column()
  @Index()
  takerAssetData: string

  @Column('decimal', { precision: 72, nullable: true })
  makerAssetFilledAmount?: string

  @Column('decimal', { precision: 72, nullable: true })
  takerAssetFilledAmount?: string

  @Column('decimal', { precision: 72, nullable: true })
  makerFeePaid?: string

  @Column('decimal', { precision: 72, nullable: true })
  takerFeePaid?: string

  @Column('bigint')
  @Index()
  timestamp: number
}
