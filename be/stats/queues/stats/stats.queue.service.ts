import config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { QueuesName } from 'common/constants/queues/name';
import { JobOptions, Queue } from 'bull';
import { Injectable } from '@nestjs/common';

import { QueueDataType } from 'common/types/queue.data.type';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { NFTMarketEventsReaderService } from 'common/blockchain/events-readers/NFT-market.events-reader.service';
import { QueueProcessorMethodsNames } from 'common/constants/queues/methods-names';
import { clearQueueJobs } from '../../../../common/utils/functions';

@Injectable()
export class StatsQueueService {
  logger = CustomLogger(StatsQueueService.name);

  constructor(
    @InjectQueue(QueuesName.STATS) private readonly statsQueue: Queue,
    private readonly nftCollectionMigrationEventsService: NFTMarketEventsReaderService,
  ) {}

  async [QueueProcessorMethodsNames.COLLECT_BLOCKCHAIN_EVENTS]() {
    try {
      await this.nftCollectionMigrationEventsService.saveEvents();
    } catch (e) {
      this.logger.error(e.message, e.stack);
    }
    return true;
  }

  async runCollectBlockchainEvents(): Promise<void> {
    const cronData: QueueDataType = {
      method: QueueProcessorMethodsNames.COLLECT_BLOCKCHAIN_EVENTS,
    };

    const cronOptions: JobOptions = {
      repeat: {
        cron: config.cronJobs.collectBlockchainEvents,
      },
    };

    await clearQueueJobs(this.statsQueue, QueueProcessorMethodsNames.COLLECT_BLOCKCHAIN_EVENTS, this.logger);

    await this.statsQueue.add(
      QueueProcessorMethodsNames.COLLECT_BLOCKCHAIN_EVENTS,
      cronData,
      cronOptions,
    );
  }
}
