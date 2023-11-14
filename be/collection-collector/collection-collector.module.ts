import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CollectionCollectorEventsSchema } from './schemas/collection-collector.events.schema';
import { CollectionCollectorRepository } from './collection-collector.repository';
import { BullModule } from '@nestjs/bull';
import { QueuesName } from 'common/constants/queues/name';
import { CollectionCollectorQueueService } from './queues/collection-collector.queue.service';
import { CollectionCollectorQueueProcessor } from './queues/collection-collector.queue.processor';
import { BlockchainCollectionCollectorService } from './utils/blokchain/blockchain-collection-collector.service';
import { CollectionCollectorService } from './collection-collector.service';
import { AccountsModule } from '../accounts/accounts.module';
import { NftsModule } from '../nfts/nfts.module';
import { CollectionCollector } from 'common/blockchain/core/collection-collector';
import { CollectionCollectorCollectionsSchema } from './schemas/collection-collector.collections.schema';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  imports: [
    AccountsModule,
    NftsModule,
    CollectionsModule,
    BullModule.registerQueue({
      name: QueuesName.COLLECT_NFT_COLLECTIONS,
    }),
  ],
  providers: [
    CollectionCollectorRepository,
    CollectionCollectorService,
    CollectionCollectorQueueService,
    CollectionCollectorQueueProcessor,
    BlockchainCollectionCollectorService,
    CollectionCollector,
    {
      provide: 'EventsSchema',
      useValue: CollectionCollectorEventsSchema,
    },
    {
      provide: 'ContractsSchema',
      useValue: CollectionCollectorCollectionsSchema,
    },
    {
      provide: CollectionCollectorCollectionsSchema.name,
      useValue: CollectionCollectorCollectionsSchema,
    },
  ],
})

export class CollectionCollectorModule implements OnApplicationBootstrap {
  constructor(
    private readonly collectionCollectorQueueService: CollectionCollectorQueueService,
  ) {
  }

  onApplicationBootstrap(): any {
    this.collectionCollectorQueueService.run();
  }
}
