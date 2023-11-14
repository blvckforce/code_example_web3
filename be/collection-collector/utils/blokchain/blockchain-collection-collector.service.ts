import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { CollectionCollector } from 'common/blockchain/core/collection-collector';
import { ContractType } from 'common/blockchain/core/enums';
import { AccountsService } from '../../../accounts/services/accounts.service';
import { NftsService } from '../../../nfts/services/nfts.service';
import { parseDataEventsListData } from 'common/blockchain/core/utils';
import { CollectionsService } from '../../../collections/services/collections.service';


@Injectable()
export class BlockchainCollectionCollectorService {
  logger = CustomLogger(BlockchainCollectionCollectorService.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly nftsService: NftsService,
    private readonly collectionCollector: CollectionCollector,
    private readonly collectionsService: CollectionsService,
  ) {
  }

  collect(contractAddress: string, httpProviderAddress: string) {
    return this.collectionCollector
      .collector(ContractType.C721, contractAddress, httpProviderAddress)
      .getCollectedData();
  }

  getBaseData(contractAddress: string, httpProviderAddress: string) {
    return this.collectionCollector
      .collector(ContractType.C721, contractAddress, httpProviderAddress)
      .getBaseInfo();
  }

  async getData(contractAddress: string, httpProviderAddress: string) {
    const events = await this.collect(contractAddress, httpProviderAddress);

    return parseDataEventsListData(events);
  }

  async readCollection(contractAddress: string, httpProviderAddress: string) {
    const data = await this.getData(contractAddress, httpProviderAddress);

    if (_.isEmpty(data)) {
      return;
    }

    const accounts = await this.accountsService.bulkCreate(_.map(data, 'account'));

    let collectionId = null;

    const collectionData = await this.getBaseData(contractAddress, httpProviderAddress);

    if (!collectionData.name) {
      this.logger.error('Can not get collection');
    } else {
      const collection = await this.collectionsService.findOrCreate(
        {
          name: collectionData.name,
          url: collectionData.url,
          contractAddress: collectionData.address,
          slug: collectionData.symbol || _.chain(collectionData).get('name').toLower().trim().replace(/\s/g, '_').value(),
        },
      );

      collectionId = collection.id;
    }

    await this.nftsService.createCollectedNTFList(
      _.map(
        data,
        ({ account, ...rest }) => ({
          ...rest,
          account,
          accountId:  _.find(accounts, ['address', account.address])?.id,
          colectionId: collectionId,
        }),
      ),
    );
  }

}
