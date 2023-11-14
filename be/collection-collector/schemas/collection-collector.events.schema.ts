import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Required } from 'common/decorators';
import { EventData } from 'web3-eth-contract';
import { ChainSchema } from '../../chains/schemas/chain.schema';

@Table({
  tableName: 'collection_collector_events',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'address', 'chainId'],
    },
  ],
})
export class CollectionCollectorEventsSchema extends Model {
  @Required()
  @Column
  address: string;

  @Required()
  @Column
  eventId: string;

  @ForeignKey(() => ChainSchema)
  @Column
  chainId: number;

  @Column
  blockNumber: number;

  @Required(false)
  @Column
  hasError: boolean;

  @Column(DataType.JSONB)
  data: EventData;

  @Column(DataType.JSONB)
  parsedData: EventData;
}

