import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsQueueService } from './queues/stats/stats.queue.service';
import { QueuesName } from '../../common/constants/queues/name';
import { BullModule } from '@nestjs/bull';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { EventsSchema } from './schemas/events.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueuesName.STATS,
    }),
  ],
  controllers: [StatsController],
  providers: [
    {
      provide: EventsSchema.name,
      useValue: EventsSchema,
    },
    // StatsService,
    // StatsRepository,
    // StatsQueueService,
    // StatsQueueProcessor,
    // NFTMarketEventsReaderService,
  ],
})
export class StatsModule implements OnApplicationBootstrap {
  logger = CustomLogger(StatsModule.name);

  constructor(
    private readonly statsQueueService: StatsQueueService,
  ) {
  }

  onApplicationBootstrap(): any {
    this.statsQueueService.runCollectBlockchainEvents()
      .catch((e) => this.logger.error('CollectBlockchainEvents has Error', e.stack));
  }

}
