import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Required } from 'common/decorators';
import { ChainSchema } from '../../chains/schemas/chain.schema';

@Table({
  tableName: 'collection_collector_collections',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class CollectionCollectorCollectionsSchema extends Model {
  @Required()
  @Column({ unique: true })
  address: string;

  @ForeignKey(() => ChainSchema)
  @Required()
  @Column
  chainId: number;

  @Required(0)
  @Column
  firsBlockNumber: number;

  @Column
  defaultName: string;

  @Column
  defaultUrl: string;

  @Column
  defaultSymbol: string;

  @Required(false)
  @Column
  isDisabled: boolean;

  @Required(false)
  @Column
  isInProgress: boolean;

  @Column
  lastReadBlockNumber: number;

  @Column
  lastCheckDate: Date;

  @BelongsTo(() => ChainSchema)
  chain: ChainSchema;
}

