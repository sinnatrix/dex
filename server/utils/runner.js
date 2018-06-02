const Config = require('../models/Config')
Config.initBasic()

const log = require('./log')

const mongoose = require('mongoose')
mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`).then(Config.init)

module.exports = async task => {
  try {
    await task()
  } catch (e) {
    log.error(e)
  }

  mongoose.connection.close()
}
