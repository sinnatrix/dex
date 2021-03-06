import { AwilixContainer } from 'awilix'
import JobRepository from '../repositories/JobRepository'

import { getNowUnixtime } from '../utils/helpers'
import log from '../utils/log'
import { JobStatus, ITask } from '../types'
import OrderBlockchainService from './OrderBlockchainService'

class JobService {
  container: AwilixContainer
  jobRepository: JobRepository
  orderBlockchainService: OrderBlockchainService

  constructor ({ container, connection, orderBlockchainService }) {
    this.container = container
    this.orderBlockchainService = orderBlockchainService
    this.jobRepository = connection.getCustomRepository(JobRepository)
  }

  async execute (taskName: string, taskParams: any = {}) {
    const fullTaskName = taskName + 'Task'

    const task = this.container.resolve<ITask>(fullTaskName)

    let job

    try {
      job = await this.createJob(fullTaskName, taskParams)
    } catch (e) {
      log.error(e)
      return
    }

    try {
      const completedJob = await task.run(job)
      await this.jobRepository.save({
        ...completedJob,
        updatedAt: getNowUnixtime(),
        status: JobStatus.COMPLETED
      } as any)
    } catch (e) {
      log.error(`Job failed:`, e.message)
      await this.jobRepository.update({ id: job.id }, {
        updatedAt: getNowUnixtime(),
        status: JobStatus.FAILED
      } as any)
    }
  }

  async createJob (fullTaskName, taskParams) {
    let job
    let entityProps = {
      taskName: fullTaskName,
      ...taskParams,
      status: JobStatus.ACTIVE
    }

    if (taskParams.fromBlock !== undefined || taskParams.toBlock !== undefined) {
      let { fromBlock, toBlock, ...rest } = entityProps

      fromBlock = fromBlock === undefined ? 1 : fromBlock
      const latestBlockNumber = (await this.orderBlockchainService.getBlock('latest')).number

      toBlock = Math.min(
        toBlock === undefined ? latestBlockNumber : toBlock,
        latestBlockNumber
      )

      entityProps = {
        ...rest,
        fromBlock,
        toBlock
      }

      job = await this.jobRepository.findLoadEventsJob(entityProps)
    } else {
      job = await this.jobRepository.findActiveJob(entityProps)
    }

    if (job) {
      throw new Error(`Job for task ${fullTaskName} found; params ${JSON.stringify(taskParams)}`)
    }

    job = {
      ...entityProps,
      createdAt: getNowUnixtime()
    }

    await this.jobRepository.save(job)

    return job
  }
}

export default JobService
