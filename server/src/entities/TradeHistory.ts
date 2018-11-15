import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('tradeHistory')
export default class TradeHistory {
  @PrimaryGeneratedColumn()
  id: 'bigint'

  @Column()
  orderHash: 'string'

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

  @Column()
  txHash: 'string'
}
