const { EntitySchema } = require('typeorm')

const Token = new EntitySchema({
  name: 'Token',
  tableName: 'tokens',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: true
    },
    address: {
      type: 'varchar'
    },
    minAmount: {
      type: 'varchar'
    },
    maxAmount: {
      type: 'varchar'
    },
    precision: {
      type: 'int'
    },
    decimals: {
      type: 'int'
    },
    symbol: {
      type: 'varchar'
    },
    name: {
      type: 'varchar'
    },
    abi: {
      type: 'jsonb',
      nullable: true
    }
  }
})

module.exports = Token
