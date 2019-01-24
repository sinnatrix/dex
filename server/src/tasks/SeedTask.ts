import { up } from '../../seeders/init-db'
import { getNetworkNameById } from '../utils/helpers'
import JobEntity from '../entities/Job'

class SeedTask {
  networkName: string
  connection: any

  constructor ({ networkId, connection }) {
    this.networkName = getNetworkNameById(networkId)
    this.connection = connection
  }

  async run (job: JobEntity): Promise<JobEntity> {
    await up(this.connection, this.networkName)
    return job
  }
}

export default SeedTask
