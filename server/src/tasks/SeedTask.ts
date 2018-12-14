import { up } from '../../seeders/init-db'
import { getNetworkNameById } from '../utils/helpers'

export default class SeedTask {
  networkName: string
  connection: any

  constructor ({ networkId, connection }) {
    this.networkName = getNetworkNameById(networkId)
    this.connection = connection
  }

  async run () {
    await up(this.connection, this.networkName)
  }
}
