import * as _ from 'lodash';
import { EventsReaderBase } from '../events-readers/events-reader-base';
import { IBaseContract } from '../contacts/base.contract';
import axios from 'axios';
import {
  CollectionType,
  EventDataType,
  EventParsedData,
} from '../types';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';
import { Model } from '../../../utils/Model';
import { EventData } from 'web3-eth-contract';
import { parseImageUrl, parseUrlData } from '../utils';
import {
  GetAllLastEventsByAddress,
  GetAllLastEventsByAddressWithoutNft,
} from '../../../raw-db-queries/collection-collector';
import { getWhereForContactAddress } from '../../../utils/functions';

interface IErc721Collector {
  readonly contract: IBaseContract;

  getEvents(address: string): Promise<number>;

  getCollectedData(): Promise<CollectionType[]>;

  getCollectionsTokens(blockStartsFrom, address): Promise<CollectionType[]>;

  getBaseInfo(): Promise<{ symbol: string | null; name: string | null; url: string | null, address: string }>;
}

export class Erc721Collector implements IErc721Collector {
  logger = CustomLogger(Erc721Collector.name);

  constructor(
    readonly contract: IBaseContract,
    private readonly eventsReaderBase: EventsReaderBase,
    private readonly eventsModel: typeof Model,
    private readonly contractsModel: typeof Model,
  ) {
  }

  async getEvents(address: string): Promise<number> {
    return  this.contractsModel.sequelize.transaction(async (transaction) => {
      let blockStartsFrom = 0;

      const contract: any = await this.contractsModel.findOne({
        where: getWhereForContactAddress(address),
        transaction,
      });
      if (contract) {
        blockStartsFrom = contract.lastReadBlockNumber ? contract.lastReadBlockNumber : contract.firsBlockNumber;
      }

      const {
        events,
        latestBlockNumber,
      } = await this.eventsReaderBase.getEventsList(
        blockStartsFrom,
        'Transfer',
      );

      const dataToSave = _.map(events, (event) => ({
        eventId: event.eventId,
        address: event.address,
        blockNumber: _.toNumber(event.blockNumber),
        data: event,
      }));

      await this.eventsModel.bulkCreate(dataToSave, { ignoreDuplicates: true, transaction });

      await this.contractsModel.update(
        {
          lastReadBlockNumber: latestBlockNumber,
          lastCheckDate: new Date(),
        },
        {
          where: getWhereForContactAddress(address),
          transaction,
        },
      );

      return blockStartsFrom;
    });
  }

  async parseEventsDataAndSave(address: string, blockStartsFrom: number) {
    const eventsList = <any> await this.eventsModel.sequelize.query(GetAllLastEventsByAddress(address, blockStartsFrom));

    const promises = _.map(eventsList?.[0], async (row: { id: number, data: EventData, eventId: string }) => {
      try {
        const eventData = <EventDataType>
          _.pickBy(
            row?.data?.returnValues,
            (value, key) => _.chain(key)
              .toNumber()
              .isFinite()
              .value() === false,
          );

        const hasBeenDeleted = _.toNumber(eventData.to) === 0;

        const parsedEvent: EventParsedData = {
          eventId: row.eventId,
          hasError: false,
          address,
          parsedData: {
            hasBeenDeleted,
            contractAddress: address,
            eventData,
          },
        };

        if (hasBeenDeleted === false) {
          const url = parseImageUrl(
            await this.contract
              .methods
              .tokenURI(eventData.tokenId)
              .call(),
          );

          parsedEvent.parsedData.url = url;

          const { data: urlData } = await axios.get(url);

          parsedEvent.parsedData.urlData = parseUrlData(urlData);
        }

        return parsedEvent;
      } catch (e) {
        this.logger.error(e.message, e.stack);
        this.eventsModel.update({ hasError: true }, { where: { id: row.id } });
        return null;
      }
    });

    const parsedEvents = _.compact(await Promise.all(promises));
    await this.eventsModel.bulkCreate(parsedEvents, { updateOnDuplicate: ['hasError', 'parsedData'] });
  }

  async getCollectionsTokens(address: string) {
    const parsedEvenDataListToProcess = await this.eventsModel.sequelize.query(GetAllLastEventsByAddressWithoutNft(address));

    return <CollectionType[]>_.map(parsedEvenDataListToProcess?.[0], 'parsedData');
  }

  async getCollectedData(): Promise<CollectionType[]> {
    const address = this.contract.address;

    try {
      this.logger.log(`Getting events for ${address}`);
      const blockStartsFrom = await this.getEvents(address);
      this.logger.log(`Parsing events for ${address}`);
      await this.parseEventsDataAndSave(address, blockStartsFrom);
      this.logger.log(`Getting data for ${address}`);
    } catch (e) {
      this.logger.error(`Error when interact with contract ${address}: ${e.message}`, e.stack);
    }

    try {
      return await this.getCollectionsTokens(address);
    } catch (e) {
      this.logger.error(`Error when try get data for contract ${address}: ${e.message}`, e.stack);
      return ;
    }
  }

  async getBaseInfo(): Promise<{ symbol: string | null; name: string | null; url: string | null, address: string }> {
    const address = this.contract.address;
    const contract: any = await this.contractsModel.findOne({
      where: {
        address,
      },
    });

    return {
      name: await this.contract.name() || contract.name,
      symbol: await this.contract.symbol() || contract.symbol,
      url: await this.contract.contractURI() || contract.url,
      address,
    };
  }
}
