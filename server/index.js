const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const log = require('./utils/log')
const mongoose = require('mongoose')
const Relayer = require('./models/Relayer')

mongoose.connect(`mongodb://localhost/${config.DB_NAME}`)

const v0relayer = require('./routes/v0relayer')

const app = express()

app.use(bodyParser.json())

app.use('/api/v0', v0relayer)

app.get('/api/relayers', async (req, res) => {
  const relayers = await Relayer.find()
  res.json(relayers)
})

app.listen(config.PORT, () => {
  log.info('started server on port', config.PORT)
})
