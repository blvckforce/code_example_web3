import * as _ from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { CollectionCollectorCollectionsSchema } from './schemas/collection-collector.collections.schema';
import { getWhereForContactAddress } from '../../common/utils/functions';
import { ChainSchema } from '../chains/schemas/chain.schema';

@Injectable()
export class CollectionCollectorRepository {
  constructor(
    @Inject(CollectionCollectorCollectionsSchema.name)
    private readonly collectionCollectorCollectionsSchema: typeof CollectionCollectorCollectionsSchema,
  ) {
  }

  setAllIsInProgress(isInProgress = false) {
    return this.collectionCollectorCollectionsSchema.update(
      { isInProgress },
      { where: { isInProgress : !isInProgress, isDisabled: false } },
    );
  }

  async getNotInProgress() {
    return _.map(
      await this.collectionCollectorCollectionsSchema.findAll(
        {
          where: { isInProgress: false, isDisabled: false },
          include: [
            {
              model: ChainSchema,
              required: true,
              as: 'chain',
            },
          ],
        },
      ),
      (data) => _.get(data, 'dataValues'),
    );
  }

  setInProgress(address: string, isInProgress: boolean) {
    return this.collectionCollectorCollectionsSchema.update({ isInProgress }, { where: getWhereForContactAddress(address) });
  }
}
