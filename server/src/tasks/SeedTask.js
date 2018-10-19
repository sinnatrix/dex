const initDbSeeder = require('../../seeders/init-db')

class SeedTask {
  constructor ({ connection }) {
    this.connection = connection
  }

  async run () {
    await initDbSeeder.up(this.connection)
  }
}

module.exports = SeedTask
