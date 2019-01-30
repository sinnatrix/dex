import JobService from './JobService'
import log from '../utils/log'
import JobRepository from '../repositories/JobRepository'
import { JobStatus } from '../types'
const CronJob = require('cron').CronJob

class CronService {
  jobService: JobService
  jobRepository: JobRepository

  constructor ({ jobService, jobRepository }) {
    this.jobService = jobService
    this.jobRepository = jobRepository
  }

  async attach () {
    const checkActiveOrders = new CronJob(
      '0 */5 * * * *',
      this.checkActiveOrders.bind(this),
      null,
      true
    )
    log.info(`CheckActiveOrdersTask: is${!checkActiveOrders.running ? ' not' : ''} running`)

    const loadTradeHistoryLastBlocksJob = new CronJob(
      '0 */10 * * * *',
      this.loadTradeHistoryLastBlocks.bind(this),
      null,
      true
    )
    log.info(`LoadTradeHistoryLastBlocks: is${!loadTradeHistoryLastBlocksJob.running ? ' not' : ''} running`)
  }

  async checkActiveOrders () {
    await this.jobService.execute('checkActiveOrders')
  }

  async loadTradeHistoryLastBlocks () {
    const CHUNK_SIZE_BLOCKS = 1000
    const TASK_NAME = 'loadTradeHistory'

    const query = this.jobRepository.createQueryBuilder('jobs')
      .where(`"taskName" = :taskName`, { taskName: `${TASK_NAME}Task` })
      .andWhere(`status = :status`, { status: JobStatus.COMPLETED })
      .orderBy(`"toBlock"`, 'DESC')

    const latestCompletedJob = await query.getOne()

    const fromBlock = latestCompletedJob ? +latestCompletedJob.toBlock + 1 : 1
    const toBlock = fromBlock + CHUNK_SIZE_BLOCKS - 1

    await this.jobService.execute(TASK_NAME, { fromBlock, toBlock })
  }
}

export default CronService
