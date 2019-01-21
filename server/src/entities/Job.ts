import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { JobStatus } from '../types'

@Entity('jobs')
class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  taskName: string

  @Column('bigint', { nullable: true })
  fromBlock?: number

  @Column('bigint', { nullable: true })
  toBlock?: number

  @Column('bigint', { nullable: true })
  currentBlock?: number

  @Column('bigint')
  createdAt: number

  @Column('bigint', { nullable: true })
  updatedAt?: number

  @Column('enum', { enum: JobStatus, default: JobStatus.CREATED })
  status: JobStatus
}

export default Job
