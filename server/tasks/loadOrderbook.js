const db = require('../utils/db')
const log = require('../utils/log')
const Relayer = require('../models/Relayer')

const mainAsync = async () => {
  const coll = await db.getColl('relayers')
  const item = await coll.findOne({name: 'Radar Relay'})

  const relayer = new Relayer(item)

  const orderbook = await relayer.loadOrderbook()

  log.info(orderbook)

  db.closeConn()
}

mainAsync()
  .catch(console.error)
  .then(() => {
    db.closeConn()
  })
