const { EntitySchema } = require('typeorm')

const TokenPair = new EntitySchema({
  name: 'TokenPair',
  tableName: 'tokenPairs',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: true
    },
    tokenAId: {
      type: 'bigint'
    },
    tokenBId: {
      type: 'bigint'
    }
  }
})

module.exports = TokenPair
