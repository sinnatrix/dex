const bunyan = require('bunyan')

const log = bunyan.createLogger({ name: 'dex' })

module.exports = log
