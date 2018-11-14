import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('orders')
export default class Order {
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
  /** End of SRA v 2.0.0 order specification */

  /** Start metaData */
  @Column()
  remainingTakerAssetAmount: 'string'

  @Column()
  orderHash: 'string'
  /** End metaData */

  @Column()
  makerAssetProxyId: 'string'

  @Column()
  takerAssetProxyId: 'string'

  @Column()
  makerAssetAddress: 'string'

  @Column()
  takerAssetAddress: 'string'
}
