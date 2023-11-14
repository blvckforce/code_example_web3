import * as _ from 'lodash';
import { IBaseContract } from '../contacts/base.contract';
import { EventType } from '../../../types/event.type';
import { Filter } from 'web3-eth-contract';

export class EventsReaderBase {
  constructor(
    readonly contract: IBaseContract,
  ) {
  }

  async getEventsList(blockStartsFrom: number, eventName: string, filter?: Filter): Promise<{ latestBlockNumber: number, events: EventType[] }> {
    const latestBlockNumber = await this.contract.provider.eth.getBlockNumber();
    const blockNumberToProcess = latestBlockNumber - 1;

    const ranges: { fromBlock: number, toBlock: number }[] = [
      {
        fromBlock: blockStartsFrom,
        toBlock: blockNumberToProcess,
      },
    ];

    while (_.last(ranges).toBlock - _.last(ranges).fromBlock > 5000) {
      const lastItem = _.last(ranges);
      const lastItemToBlock = lastItem.toBlock;
      const newLastItemToBlock = lastItem.fromBlock + 4999;

      lastItem.toBlock = newLastItemToBlock > latestBlockNumber ? latestBlockNumber : newLastItemToBlock;

      ranges.push({
        fromBlock: lastItem.toBlock + 1,
        toBlock: lastItemToBlock,
      });
    }

    const promises = await Promise.allSettled(
      _.map(
        ranges,
        ({ fromBlock, toBlock }) => {
          return this.contract.contract.getPastEvents(eventName, {
            filter,
            fromBlock,
            toBlock,
          });
        },
      ),
    );

    const events = <unknown>_.chain(promises)
      .flatten()
      .map('value')
      .compact()
      .flattenDeep()
      .map(
        ({ id, ...rest }) => ({ eventId: id, ...rest } ),
      )
      .value();


    return {
      latestBlockNumber,
      events: events as EventType[],
    };
  }

  getEventListData(events: EventType[], fields: string[]) {
    return _.map(events, (event) => _.pick(event, fields));
  }
}
