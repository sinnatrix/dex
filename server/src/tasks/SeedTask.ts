import { up } from '../../seeders/init-db'

export default class SeedTask {
  connection: any

  constructor ({ connection }) {
    this.connection = connection
  }

  async run () {
    await up(this.connection)
  }
}
