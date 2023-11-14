import * as _ from 'lodash';
import { EventsReaderBase } from '../core/events-readers/events-reader-base';
import { Injectable } from '@nestjs/common';
import { NFTMarketSolidContract } from '../contracts/nft-market-solid/NFT-market-solid.contract';
import { plainToClass } from 'class-transformer';
import { NftMarketEventsDto } from '../../dto/nft-market-events.dto';
import { StatsRepository } from '../../../modules/stats/repositories/stats.repository';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';

// TODO REFACTOR
@Injectable()
export class NFTMarketEventsReaderService extends EventsReaderBase {
  logger = CustomLogger(NFTMarketEventsReaderService.name);

  constructor(
    private readonly statsRepository: StatsRepository,
  ) {
    super(new NFTMarketSolidContract());
  }

  async getEventsList() {
    const foundLatestBlockNumber = <number> await this.statsRepository.getBlockNumberByAddress(this.contract.address);
    const blockNumber =  foundLatestBlockNumber + 1 || 11334739;

    const { events, latestBlockNumber } = await super.getEventsList(blockNumber, 'eSales');

    const data = this.getEventListData(
      events,
      [
        'eventId',
        'address',
        'blockHash',
        'blockNumber',
        'logIndex',
        'removed',
        'transactionHash',
        'transactionIndex',
        'event',
        'signature',
        'returnValues.id',
        'returnValues.tokenId',
        'returnValues.buyer',
        'returnValues.price',
        'returnValues.currency',
      ],
    );

    return {
      latestBlockNumber,
      events: _.map(data, (event) => plainToClass(NftMarketEventsDto, event)),
    };
  }

  async saveEvents() {
    try {
      const { events } = await this.getEventsList();
      return await this.statsRepository.saveEvents(events);
    } catch (e) {
      this.logger.error(e.message, e.stack);
    }
  }
}
