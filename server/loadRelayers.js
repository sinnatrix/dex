const log = require('./log')
const relayers = require('./relayers')

const mainAsync = async () => {

  const items = await relayers.load()

  log.info({items})
}

mainAsync().catch(console.error)
