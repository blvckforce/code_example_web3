import { Inject, Injectable } from '@nestjs/common';
import { ContractAbi, ContractType } from '../enums';
import { Erc721Collector } from './erc721.collector';
import { RawHttpContract } from '../contacts/raw-http-contract.service';
import { EventsReaderBase } from '../events-readers/events-reader-base';
import { Model } from '../../../utils/Model';


@Injectable()
export class CollectionCollector {
  constructor(
    @Inject('EventsSchema') private readonly eventsModel: typeof Model,
    @Inject('ContractsSchema') private readonly contractsModel: typeof Model,
  ) {
  }


  collector(type: ContractType, contractAddress: string) {
    const contract = new RawHttpContract()
      .setAbi(ContractAbi[type])
      .setAddress(contractAddress);

    switch (type) {
      case ContractType.C721: {
        return new Erc721Collector(
          contract,
          new EventsReaderBase(contract),
          this.eventsModel,
          this.contractsModel,
        );
      }
      default: {
        throw new Error('Unknown type');
      }
    }
  }
}
