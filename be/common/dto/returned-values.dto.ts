import { NFTMarketValuesType } from '../types/return-values.types';
import { ToNumber } from '../decorators';

export class ReturnedValuesDto implements NFTMarketValuesType {
  buyer: string;

  currency: string;

  @ToNumber()
  id: number;

  nft: string;

  @ToNumber()
  price: number;

  seller: string;

  @ToNumber()
  tokenId: number;

}
