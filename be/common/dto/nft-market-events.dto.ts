import { ToNumber } from '../decorators';
import { ReturnedValuesDto } from './returned-values.dto';
import { Type } from 'class-transformer';
import { EventType } from '../types/event.type';

export class NftMarketEventsDto implements EventType {
  eventId: string;

  address: string;

  event: string;

  signature: string;

  @ToNumber()
  logIndex: number;

  @ToNumber()
  transactionIndex: number;

  transactionHash: string;

  blockHash: string;

  @ToNumber()
  blockNumber: number;

  @Type()
  returnValues: ReturnedValuesDto;
}
