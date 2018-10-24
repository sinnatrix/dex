import { EntitySchema } from 'typeorm'

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

export default TokenPair
