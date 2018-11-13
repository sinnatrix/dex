import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('orders')
export default class Order  {
  @PrimaryGeneratedColumn()
  id: 'bigint'

  /** SRA v2.0.0 order attributes */
  @Column()
  makerAddress: 'string'

  @Column()
  takerAddress: 'string'

  @Column()
  feeRecipientAddress: 'string'

  @Column()
  senderAddress: 'string'

  @Column()
  makerAssetAmount: 'string'

  @Column()
  takerAssetAmount: 'string'

  @Column()
  makerFee: 'string'

  @Column()
  takerFee: 'string'

  @Column()
  expirationTimeSeconds: 'string'

  @Column()
  salt: 'string'
  
  @Column()
  makerAssetData: 'string'
  
  @Column()
  takerAssetData: 'string'
  
  @Column()
  exchangeAddress: 'string'
  
  @Column()
  signature: 'string'

  // usable in metaData
  @Column()
  remainingTakerAssetAmount: 'string'
  /** End of SRA v 2.0.0 order specification */

  @Column()
  orderHash: 'string'

  @Column()
  makerAssetProxyId: 'string'

  @Column()
  takerAssetProxyId: 'string'

  @Column()
  makerAssetAddress: 'string'

  @Column()
  takerAssetAddress: 'string'
}
