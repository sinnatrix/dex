import { up } from '../../seeders/init-db'

class SeedTask {
  connection: any

  constructor ({ connection }) {
    this.connection = connection
  }

  async run () {
    await up(this.connection)
  }
}

export default SeedTask
