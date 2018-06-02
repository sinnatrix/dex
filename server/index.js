const Config = require('./models/Config')
Config.initBasic()

const express = require('express')
const bodyParser = require('body-parser')
const log = require('./utils/log')
const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`).then(Config.init).catch(console.error)

const v0Relayer = require('./routes/v0Relayer')
const v1Own = require('./routes/v1Own')

const app = express()

app.use(bodyParser.json())

app.use('/api/relayer/v0', v0Relayer)
app.use('/api/v1', v1Own)

app.listen(process.env.PORT, () => {
  log.info('started server on port', process.env.PORT)
})
