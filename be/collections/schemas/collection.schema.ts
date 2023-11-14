import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { NftSchema } from '../../nfts/schemas/nft.schema';
import { AccountSchema } from '../../accounts/schemas/account.schema';
import { Required } from '../../../common/decorators';

@Table({
  tableName: 'collections',
  indexes: [
    {
      unique: true,
      fields: ['contractAddress', 'name'],
    },
    {
      unique: true,
      fields: ['slug'],
    },
  ],
})
export class CollectionSchema extends Model {
  @Required()
  @Column
  name: string;

  @ForeignKey(() => AccountSchema)
  accountId: number;

  @Column({ defaultValue: '#000000' })
  color: string;

  @Column
  token: string;

  @Column
  bio: string;

  @Column
  contractAddress: string;

  // collection url
  @Column
  url: string;

  // collection symbol
  @Required()
  @Column
  slug: string;

  @Column
  avatar: string;

  @Column
  background: string;

  @Column({ defaultValue: true })
  active: boolean;

  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Column({ type: DataType.DATE })
  updatedAt: Date;

  @HasMany(() => NftSchema)
  nft: NftSchema;

  @BelongsTo(() => AccountSchema)
  account: AccountSchema;

}

