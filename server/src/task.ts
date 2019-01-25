import 'dotenv/config'
import { createConnection } from 'typeorm'
import RelayerRegistryService from './services/RelayerRegistryService'
import JobService from './services/JobService'
import ormconfig from '../ormconfig'
import createAppContainer from './container'
const argv = require('yargs').argv
const { asClass, asValue } = require('awilix')

;(async () => {
  const connection = await createConnection(ormconfig as any)

  const { _: positionParams, $0: executationPath, ...taskParams } = argv

  const [ taskName ] = positionParams

  const container = createAppContainer({ connection })

  container.register({
    wsRelayerServer: asValue(null),
    relayerRegistryService: asClass(RelayerRegistryService).singleton(),
    jobService: asClass(JobService).singleton()
  })

  await container.resolve('jobService').execute(taskName, taskParams)
})().then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
