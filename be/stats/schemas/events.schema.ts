import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { Required } from 'common/decorators';
import { NFTMarketValuesType } from 'common/types/return-values.types';

@Table({ tableName: 'Event' })
// export class EventsSchema
//   extends Model<ICalendar, CalendarFields>
//   implements CalendarFields {
export class EventsSchema extends Model {
  @Column({ unique: 'contract_event' })
  eventId: string;

  @Required()
  @Column
  event: string;

  @Required()
  @Column
  signature: string;

  @Required()
  @Column
  logIndex: number;

  @Required()
  @Column
  transactionIndex: number;

  @Required()
  @Column
  transactionHash: string;

  @Required()
  @Column
  blockHash: string;

  @Required()
  @Column
  blockNumber: number;

  @Required()
  @Column({ unique: 'contract_event' })
  address: string;

  @Required()
  @Column(DataType.JSONB)
  returnValues: NFTMarketValuesType;
}
