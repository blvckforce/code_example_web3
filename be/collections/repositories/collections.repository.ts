import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import { CollectionSchema } from '../schemas/collection.schema';
import { AccountSchema } from '../../accounts/schemas/account.schema';
import { GetListCollectionsDto } from '../dto/get-list-collections.dto';
import { WhereBuilder } from '../../../common/repository/where.builder';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';
import { NftSchema } from '../../nfts/schemas/nft.schema';
import { NftPropertySchema } from '../../nfts/schemas/nft-property.schema';
import { CreateCollectionType } from '../types/CreateCollectionType';

@Injectable()
export class CollectionsRepository {
  constructor(@Inject(CollectionSchema.name) private readonly collectionSchema: typeof CollectionSchema) {
  }

  async findAllMy(dto: GetListCollectionsDto, currentAccount: any) {
    const limit = dto?.limit || 10;
    const offset = dto?.offset || 0;

    // TODO: added dto.best=true

    const whereBuilder = new WhereBuilder({ active: true, accountId: currentAccount.id });
    const where = whereBuilder.setSearch(dto.name, 'name')
      .setField(dto.slug, 'slug')
      .end();
    return this.collectionSchema.findAll({
      where,
      include: this.includeModel(),
      limit,
      offset,
      order: [['id', 'ASC']],
    });
  }

  async findAll(dto: GetListCollectionsDto) {
    const limit = dto.limit || 10;
    const offset = dto.offset || 0;

    const whereBuilder = new WhereBuilder({ active: true });
    const where = whereBuilder
      .setSearch(dto.name_contains, 'name')
      .setField(dto.name, 'name')
      .setField(dto.slug, 'slug');


    if (dto.disableDefault === true) {
      where.setField('Default Collection', 'name', true);
    }

    if (dto.best) {
      // TODO: add pagination
      return this.collectionSchema.findAll({
        // where,
        // limit,
        // offset,

        attributes: {
          include: [[Sequelize.fn('COUNT', Sequelize.col('nft.colectionId')), 'nftCount']],
        },
        include: [
          {
            model: AccountSchema,
            required: false,
          },
          {
            model: NftSchema, attributes: [],
          }],
        group: ['CollectionSchema.id', 'account.id'],
        order: [[Sequelize.col('nftCount'), 'DESC']],
      });
    }

    return this.collectionSchema.findAll({
      where: where.end(),
      include: this.includeModel(),
      limit,
      offset,
      order: [['id', 'DESC']],
    });
  }

  async findOne(id: number) {
    return this.collectionSchema.findByPk(id, { include: this.includeModel() });
  }

  async findOneByIdOrSlug(slug: number | string) {
    return this.collectionSchema.findOne({
      where: {
        [Op.or]: [
          {
            id: +slug || 0,
          },
          {
            slug,
          },
        ],
      },
      include: this.includeModel(),
    });
  }

  async findAllProperties(id: number) {
    if (!id) {
      return [];
    }

    const [res] = await CollectionSchema.sequelize.query({
      query: `SELECT ${NftPropertySchema.tableName}.key, ${NftPropertySchema.tableName}.value, COUNT(*)` +
        `FROM ${CollectionSchema.tableName} ` +
        `INNER JOIN "${NftSchema.tableName}" ON "${NftSchema.tableName}"."colectionId"=${CollectionSchema.tableName}.id ` +
        `INNER JOIN ${NftPropertySchema.tableName} ON "${NftSchema.tableName}".id=${NftPropertySchema.tableName}."nftId" ` +
        `WHERE ${CollectionSchema.tableName}.id = ? ` +
        `GROUP BY ${NftPropertySchema.tableName}.key, ${NftPropertySchema.tableName}.value;`,
      values: [id],
    });
    return _.mapValues(_.groupBy(res, 'key'), list => list.map((el: any) => ({
      value: el.value,
      count: el.count,
    })));
    // return this.collectionSchema.findAll({
    //   where: {
    //     id,
    //   },
    //   attributes:[],
    //   include: [
    //     {
    //       model: NftSchema,
    //       attributes:['properties'],
    //       include: [
    //         {
    //           model: NftPropertySchema,
    //           attributes:['key', 'value'],
    //         },
    //       ],
    //     }],
    //   group:['CollectionSchema.id', 'nft.id', 'nft.properties.id', 'nft.properties.key', 'nft.properties.value'],
    // });
  }

  async create(dto: CreateCollectionDto, currentAccountId: number) {
    await this.assertCollectionHasUniqueFields(dto);
    const { id } = await this.collectionSchema.create({
      ...dto,
      accountId: currentAccountId,
      active: true,
    });
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateCollectionDto, currentAccountId: number) {
    await this.assertCollectionHasUniqueFields(dto);
    await this.collectionSchema.update(
      dto,
      {
        where: {
          id: _.toNumber(id),
          accountId: currentAccountId,
        },
      });
    return this.findOne(id);
  }

  async delete(id: number, currentAccountId: number) {
    return this.collectionSchema.destroy({
      where: {
        id: _.toNumber(id),
        accountId: currentAccountId,
      },
    });
  }

  private async assertCollectionHasUniqueFields(dto: UpdateCollectionDto) {
    const collection = await this.collectionSchema.findOne({
      where: {
        [Op.or]: {
          // name: dto.name,
          url: dto.url,
        },
      },
    });

    if (collection) {
      let message = '';

      // if (collection.name && dto.name && collection.name === dto.name) {
      //   message += `A collection name "${dto.name}" exists`;
      // }

      if (collection.url && dto.url && collection.url === dto.url) {
        message += `A collection with url "${dto.url}" exists`;
      }

      throw new ConflictException(message);
    }
  }

  private includeModel() {
    return [
      {
        model: AccountSchema,
        required: false,
      },
    ];
  }

  async findOrCreate(data: CreateCollectionType) {
    const [collection] = await this.collectionSchema.findOrCreate(
      {
        where: {
          name: data.name,
          contractAddress: data.contractAddress,
        },
        defaults: data,
      },
    );

    return collection;
  }

}
