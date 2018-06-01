const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const {getColl} = require('./utils/db')
const log = require('./utils/log')

const v0relayer = require('./routes/v0relayer')

const app = express()

app.use(bodyParser.json())

app.use('/api/v0', v0relayer)

app.get('/api/relayers', async (req, res) => {
  const coll = await getColl('relayers')
  const relayers = await coll.find().toArray()
  res.json(relayers)
})

app.listen(config.PORT, () => {
  log.info('started server on port', config.PORT)
})
