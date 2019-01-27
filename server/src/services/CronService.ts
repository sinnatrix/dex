import JobService from './JobService'
import log from '../utils/log'
const CronJob = require('cron').CronJob

class CronService {
  jobService: JobService

  constructor ({ jobService }) {
    this.jobService = jobService
  }

  async attach () {
    const checkActiveOrders = new CronJob(
      '0 */5 * * * *',
      this.checkActiveOrders.bind(this),
      null,
      true
    )
    log.info(`CheckActiveOrdersTask: is${!checkActiveOrders.running ? ' not' : ''} running`)
  }

  async checkActiveOrders () {
    await this.jobService.execute('checkActiveOrders')
  }
}

export default CronService
