import { QueuesName } from 'common/constants/queues/name';
import { OnQueueError, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QueueDataType } from 'common/types/queue.data.type';
import { StatsQueueService } from './stats.queue.service';
import { ModuleRef } from '@nestjs/core';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { QueueProcessorMethodsNames } from 'common/constants/queues/methods-names';

@Processor(QueuesName.STATS)
export class StatsQueueProcessor {
  logger = CustomLogger(StatsQueueProcessor.name);

  constructor(private moduleRef: ModuleRef) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );
  }

  @OnQueueError()
  onError(job) {
    this.logger.error(
      `ERROR job ${job.id} of type ${job.name}. Error Message: ${job.message}`, job.stack,
    );
  }

  @Process(QueueProcessorMethodsNames.COLLECT_BLOCKCHAIN_EVENTS)
  collectBlockchainEvents(job: Job<QueueDataType>) {
    return this.moduleRef.get(StatsQueueService)[job.data.method](job.data.params);
  }
}
