import { Entity, PrimaryColumn, Column, Unique } from 'typeorm'

@Entity('tradeHistory')
@Unique('tradeHistory_uq_blockNumber_logIndex', ['blockNumber', 'logIndex'])
export default class TradeHistory {
  @PrimaryColumn()
  id: string

  @Column()
  event: string

  @Column()
  orderHash: string

  @Column()
  transactionHash: string

  @Column('bigint')
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
  makerAssetData: string

  @Column()
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
  timestamp: number
}
