import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { OrderStatus } from '@0x/contract-wrappers'
import RelayerEntity from './Relayer'

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

  @Column('decimal', { precision: 72 })
  makerAssetAmount: string

  @Column('decimal', { precision: 72 })
  takerAssetAmount: string

  @Column('decimal', { precision: 72 })
  makerFee: string

  @Column('decimal', { precision: 72 })
  takerFee: string

  @Column()
  @Index()
  expirationTimeSeconds: string

  @Column()
  salt: string

  @Column()
  @Index()
  makerAssetData: string

  @Column()
  @Index()
  takerAssetData: string

  @Column()
  exchangeAddress: string

  @Column()
  signature: string
  /** /SignedOrder */

  /** OrderInfo */
  @Column('decimal', { precision: 72 , default: '0' })
  orderTakerAssetFilledAmount: string

  @PrimaryColumn()
  orderHash: string

  @Column({ default: OrderStatus.FILLABLE })
  @Index()
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

  /** relations */
  @ManyToOne(() => RelayerEntity, relayer => relayer.orders, { onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn()
  relayer?: RelayerEntity

  @Column('uuid', { nullable: true })
  relayerId?: string
}
