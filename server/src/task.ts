import 'dotenv/config'
import { createConnection } from 'typeorm'
import RelayerRegistryService from './services/RelayerRegistryService'
import ormconfig from '../ormconfig'
import createAppContainer from './container'
const argv = require('yargs').argv
const { asClass } = require('awilix')

;(async () => {
  const connection = await createConnection(ormconfig as any)

  const taskName = argv._[0]
  const fullTaskName = taskName[0].toUpperCase() + taskName.slice(1) + 'Task'
  const Task = require(`./tasks/${fullTaskName}`).default

  const container = createAppContainer({ connection })

  container.register({
    relayerRegistryService: asClass(RelayerRegistryService).singleton(),
    [taskName]: asClass(Task).singleton()
  })

  await container.resolve(taskName).run()
})().then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
