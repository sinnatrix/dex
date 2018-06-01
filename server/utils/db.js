const config = require('../config')
const log = require('./log')
const MongoClient = require('mongodb').MongoClient

let client
let conn

const getClient = async () => {
  if (!client) {
    const mongoUri = `mongodb://localhost:27017/${config.DB_NAME}`
    client = await MongoClient.connect(mongoUri)
  }
  return client
}

const getConn = async () => {
  if (!conn) {
    const lClient = await getClient()
    conn = lClient.db(config.DB_NAME)
  }
  return conn
}

const closeConn = async () => {
  if (client) {
    client.close()
  }
}

const getColl = name => {
  log.info('getColl', name)
  return getConn().then(conn => conn.collection(name))
}

module.exports = {
  getConn,
  closeConn,
  getColl
}
