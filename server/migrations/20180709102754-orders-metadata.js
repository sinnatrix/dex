// let dbm
// let type
// let seed

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  // dbm = options.dbmigrate
  // type = dbm.dataType
  // seed = seedLink
}

exports.up = async function (db) {
  const conn = await db.connection.connect(db.connectionString)
  const coll = conn.collection('orders')
  try {
    await coll.dropIndex('orderHash_1')
  } catch (e) {}

  const items = await coll.find({}).toArray()
  for (let item of items) {
    if (item.data) {
      continue
    }

    const { _id, __v, ...data } = item
    const newItem = { data, __v }
    await coll.update({ _id }, newItem)
  }

  await coll.createIndex({ 'data.orderHash': 1 }, { unique: true })

  conn.close()

  return null
}

exports.down = function (db) {
  return null
}

exports._meta = {
  version: 1
}
