import JobRepository from '../repositories/JobRepository'
import { getNowUnixtime } from '../utils/helpers'
import log from '../utils/log'
import { JobStatus, ITask } from '../types'
import OrderBlockchainService from './OrderBlockchainService'

class JobService {
  container: any
  jobRepository: JobRepository
  orderBlockchainService: OrderBlockchainService

  constructor ({ container, connection, orderBlockchainService }) {
    this.container = container
    this.orderBlockchainService = orderBlockchainService
    this.jobRepository = connection.getCustomRepository(JobRepository)
  }

  async execute (taskName: string, taskParams: any = {}) {
    const fullTaskName = taskName + 'Task'

    const task: ITask = this.container.resolve(fullTaskName)

    let job
    let entityProps = {
      taskName: fullTaskName,
      ...taskParams,
      status: JobStatus.ACTIVE
    }

    if (taskParams.fromBlock !== undefined || taskParams.toBlock !== undefined) {
      let { fromBlock, toBlock, ...rest } = entityProps

      fromBlock = fromBlock === undefined ? 1 : fromBlock
      toBlock = toBlock === undefined
        ? (await this.orderBlockchainService.getBlock('latest')).number
        : toBlock

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
      log.info(`Job for task ${fullTaskName} found; params ${JSON.stringify(taskParams)}`)
      return
    }
    log.info(`No jobs for task ${fullTaskName} found; params ${JSON.stringify(taskParams)}`)

    job = {
      ...entityProps,
      createdAt: getNowUnixtime()
    }

    await this.jobRepository.save(job)

    try {
      const completedJob = await task.run(job)
      await this.jobRepository.save({
        ...completedJob,
        updatedAt: getNowUnixtime(),
        status: JobStatus.COMPLETED
      })
    } catch (e) {
      log.error(`Job failed:`, e.message)
      await this.jobRepository.update({ id: job.id }, {
        updatedAt: getNowUnixtime(),
        status: JobStatus.FAILED
      } as any)
    }
  }
}

export default JobService
