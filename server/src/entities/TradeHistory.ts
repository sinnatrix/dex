import { Entity, PrimaryColumn, Column, Unique } from 'typeorm'

@Entity('tradeHistory')
@Unique(['blockNumber', 'logIndex'])
export default class TradeHistory {
  @PrimaryColumn()
  id: 'string'

  @Column()
  orderHash: 'string'

  @Column()
  transactionHash: 'string'

  @Column()
  blockNumber: 'string'

  @Column()
  logIndex: 'bigint'

  @Column()
  senderAddress: 'string'

  @Column()
  feeRecipientAddress: 'string'

  @Column()
  makerAddress: 'string'

  @Column()
  takerAddress: 'string'

  @Column()
  makerAssetData: 'string'

  @Column()
  takerAssetData: 'string'

  @Column()
  makerAssetFilledAmount: 'string'

  @Column()
  takerAssetFilledAmount: 'string'

  @Column()
  makerFeePaid: 'string'

  @Column()
  takerFeePaid: 'string'
}
