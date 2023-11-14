import config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { QueuesName } from 'common/constants/queues/name';
import { JobOptions, Queue } from 'bull';
import { Injectable } from '@nestjs/common';

import { QueueDataType } from 'common/types/queue.data.type';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { QueueProcessorMethodsNames } from 'common/constants/queues/methods-names';
import { clearQueueJobs } from 'common/utils/functions';
import { BlockchainCollectionCollectorService } from '../utils/blokchain/blockchain-collection-collector.service';
import { CollectionCollectorService } from '../collection-collector.service';

@Injectable()
export class CollectionCollectorQueueService {
  logger = CustomLogger(CollectionCollectorQueueService.name);

  constructor(
    @InjectQueue(QueuesName.COLLECT_NFT_COLLECTIONS) private readonly queue: Queue,
    private readonly blockchainCollectionCollectorService: BlockchainCollectionCollectorService,
    private readonly collectionCollectorService: CollectionCollectorService,

  ) {
  }

  async [QueueProcessorMethodsNames.COLLECT_COLLECTIONS]({ contractAddress, httpProviderAddress }: { contractAddress: string, httpProviderAddress: string }) {
    this.logger.log(`Collection STARTED for ${contractAddress}`);
    try {
      await this.collectionCollectorService.setInProgress(contractAddress);
      await this.blockchainCollectionCollectorService.readCollection(contractAddress, httpProviderAddress);
      this.logger.log(`Collection FINISHED for ${contractAddress}`);
    } catch (e) {
      this.logger.error(`Collection FINISHED with ERROR for ${contractAddress}`, e.message, e.stack);
    }
  }

  async [QueueProcessorMethodsNames.READ_COLLECTION_ADDRESSES]() {
    try {
      const jobs = await this.collectionCollectorService.getJobs();
      for (const { address: contractAddress, chain: { httpProviderAddress } } of jobs) {
        this.runCollector(httpProviderAddress, contractAddress).catch((e) => this.logger.error(e.message, e.stack));
      }
    } catch (e) {
      this.logger.error(e.message, e.stack);
    }
    return true;
  }

  async run(): Promise<void> {
    const cronData: QueueDataType = {
      method: QueueProcessorMethodsNames.READ_COLLECTION_ADDRESSES,
    };

    const cronOptions: JobOptions = {
      repeat: {
        cron: config.cronJobs.rectCollectionAddresses,
      },

    };

    await this.collectionCollectorService.start();

    await clearQueueJobs(this.queue, QueueProcessorMethodsNames.READ_COLLECTION_ADDRESSES, this.logger);

    if (config.isCollectorCollectionsJobEnabledOnStart) {
      await this[QueueProcessorMethodsNames.READ_COLLECTION_ADDRESSES]();
    }

    await this.queue.add(
      QueueProcessorMethodsNames.READ_COLLECTION_ADDRESSES,
      cronData,
      cronOptions,
    );
  }

  async runCollector(httpProviderAddress: string, contractAddress: string): Promise<void> {
    const cronData: QueueDataType = {
      method: QueueProcessorMethodsNames.COLLECT_COLLECTIONS,
      params: {
        httpProviderAddress,
        contractAddress,
      },
    };

    const cronOptions: JobOptions = {
      repeat: {
        cron: config.cronJobs.collectCollections,
      },
    };

    await clearQueueJobs(this.queue, QueueProcessorMethodsNames.COLLECT_COLLECTIONS, this.logger);

    if (config.isCollectorCollectionsJobDisabled) {
      this.logger.debug('job run DISABLED by "IS_COLLECTOR_COLLECTIONS_JOB_DISABLED" in env file');
      return;
    }

    if (config.isCollectorCollectionsJobEnabledOnStart) {
      await this[QueueProcessorMethodsNames.COLLECT_COLLECTIONS]({ httpProviderAddress, contractAddress });
    }

    await this.queue.add(
      QueueProcessorMethodsNames.COLLECT_COLLECTIONS,
      cronData,
      cronOptions,
    );
  }
}
