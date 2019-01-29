import { EntityRepository, Repository } from 'typeorm'
import JobEntity from '../entities/Job'
import { JobStatus, LoadEventsJobEntity } from '../types'

@EntityRepository(JobEntity)
class JobRepository extends Repository<any> {
  async findLoadEventsJob (entityProps): Promise<LoadEventsJobEntity | undefined> {
    const { status, fromBlock, toBlock, ...rest } = entityProps
    const query = this.createQueryBuilder('jobs')

    if (status !== undefined) {
      query.where('"status" = :status', { status })
    } else {
      query.where('"status" = :status', { status: JobStatus.CREATED })
    }

    query.andWhere(`int8range("fromBlock", "toBlock", '[]') && int8range(:fromBlock, :toBlock, '[]')`)
      .setParameters({ fromBlock, toBlock })
    query.andWhere({ ...rest })
      .setParameters({ ...rest })

    return query.getOne()
  }

  async findActiveJob (taskName: string): Promise<JobEntity | undefined> {
    const [ task ] = await this.find({
      where: {
        status: JobStatus.ACTIVE,
        taskName
      }
    })

    return task
  }
}

export default JobRepository
