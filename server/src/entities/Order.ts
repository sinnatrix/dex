import { Entity, PrimaryColumn, Column } from 'typeorm'
import { OrderStatus } from '@0x/contract-wrappers'

@Entity('orders')
export default class Order {
  /** SignedOrder */
  @Column()
  makerAddress: string

  @Column()
  takerAddress: string

  @Column()
  feeRecipientAddress: string

  @Column()
  senderAddress: string

  @Column()
  makerAssetAmount: string

  @Column()
  takerAssetAmount: string

  @Column()
  makerFee: string

  @Column()
  takerFee: string

  @Column()
  expirationTimeSeconds: string

  @Column()
  salt: string

  @Column()
  makerAssetData: string

  @Column()
  takerAssetData: string

  @Column()
  exchangeAddress: string

  @Column()
  signature: string
  /** /SignedOrder */

  /** OrderInfo */
  @Column({ default: '0' })
  orderTakerAssetFilledAmount: string

  @PrimaryColumn()
  orderHash: string

  @Column({ default: OrderStatus.FILLABLE })
  orderStatus: number
  /** /OrderInfo */

  /** extra */
  @Column()
  makerAssetProxyId: string

  @Column()
  takerAssetProxyId: string

  @Column()
  makerAssetAddress: string

  @Column()
  takerAssetAddress: string
  /** /extra */
}
