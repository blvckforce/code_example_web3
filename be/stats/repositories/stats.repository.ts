import { Inject, Injectable } from '@nestjs/common';
import { EventsSchema } from '../schemas/events.schema';
import { EventType } from '../../../common/types/event.type';

@Injectable()
export class StatsRepository {
  constructor(
    @Inject(EventsSchema.name) private readonly eventsSchema: typeof EventsSchema,
  ) {
  }

  saveEvents(events: EventType[]) {
    return this.eventsSchema.bulkCreate(events);
  }

  getBlockNumberByAddress(address: string) {
    return this.eventsSchema.max('blockNumber', { where: { address } });
  }
}
