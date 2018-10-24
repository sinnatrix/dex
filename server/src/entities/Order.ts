import { EntitySchema } from 'typeorm'

const Order = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: true
    },
    ecSignature: {
      type: 'jsonb'
    },
    orderHash: {
      type: 'varchar'
    },
    exchangeContractAddress: {
      type: 'varchar'
    },
    maker: {
      type: 'varchar'
    },
    taker: {
      type: 'varchar'
    },
    makerTokenAddress: {
      type: 'varchar'
    },
    takerTokenAddress: {
      type: 'varchar'
    },
    feeRecipient: {
      type: 'varchar'
    },
    makerTokenAmount: {
      type: 'varchar'
    },
    takerTokenAmount: {
      type: 'varchar'
    },
    makerFee: {
      type: 'varchar'
    },
    takerFee: {
      type: 'varchar'
    },
    expirationUnixTimestampSec: {
      type: 'varchar'
    },
    salt: {
      type: 'varchar'
    }
  }
})

export default Order
