import { Contract } from 'web3-eth-contract';

export type EventType = Record<string, () => Promise<unknown[]>>;
export type MethodsType = Record<string, (...params: unknown[]) => { call: () => Promise<any> }>;
export type TContract = Contract & Record<string, any>;

export type AttributeType = {
  trait_type: string;
  value: string;
  display_type?: 'number' | 'boost_number' | 'boost_percentage';
  max_value?: string;
};

export type URIData = {
  name: string;
  description: string;
  image: string;
  attributes: AttributeType[]
  [key: string]: unknown;
};

export type EventDataType = {
  from: string;
  to: string;
  tokenId: string;
  [key: string]: unknown;
};

export type EventParsedData = {
  address: string;
  eventId: string,
  hasError: boolean,
  parsedData: EventParserCollectionType,
};

export type EventParserCollectionType = CollectionType & {  hasBeenDeleted: boolean };

export type CollectionType = {
  eventData: EventDataType,
  contractAddress: string,
  urlData?: URIData,
  url?: string,
};
