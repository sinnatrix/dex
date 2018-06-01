const config = require('../config')
const log = require('./log')

const mongoose = require('mongoose')
mongoose.connect(`mongodb://localhost/${config.DB_NAME}`)

module.exports = async task => {
  try {
    await task()
  } catch (e) {
    log.error(e)
  }

  mongoose.connection.close()
}
