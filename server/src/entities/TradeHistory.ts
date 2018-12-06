import { Entity, PrimaryColumn, Column, Unique } from 'typeorm'

@Entity('tradeHistory')
@Unique(['blockNumber', 'logIndex'])
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

  @Column({ default: null })
  takerAddress?: string

  @Column()
  makerAssetData: string

  @Column()
  takerAssetData: string

  @Column({ default: null })
  makerAssetFilledAmount?: string

  @Column({ default: null })
  takerAssetFilledAmount?: string

  @Column({ default: null })
  makerFeePaid?: string

  @Column({ default: null })
  takerFeePaid?: string
}
