const { EntitySchema } = require('typeorm')

// const networkSchema = new Schema({
//   networkId: Number,
//   sra_http_endpoint: String,
//   sra_ws_endpoint: String,
//   static_order_fields: {
//     fee_recipient_addresses: [String]
//   }
// })

// const relayerSchema = new Schema({
//   name: String,
//   homepage_url: String,
//   app_url: String,
//   header_img: String,
//   logo_img: String,
//   networks: [networkSchema]
// })

const Relayer = new EntitySchema({
  name: 'Relayer',
  tableName: 'relayers',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: true
    },
    name: {
      type: 'varchar'
    },
    homepage_url: {
      type: 'varchar'
    },
    logo_img: {
      type: 'varchar',
      nullable: true
    },
    header_img: {
      type: 'varchar'
    },
    networks: {
      type: 'jsonb'
    }
  }
})

module.exports = Relayer
