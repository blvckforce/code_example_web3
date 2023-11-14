import { EventData } from 'web3-eth-contract';

export type EventType = Omit<EventData, 'raw' | 'id'> & {
  eventId: string;
};
