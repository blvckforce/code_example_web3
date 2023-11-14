import { CollectionType } from '../types';
import * as _ from 'lodash';
import { CreateEventsNftDto } from '../../../../modules/nfts/dto/create-events-nft.dto';
import { prepareNftPropertiesForSave } from '../../../utils/functions';
import { NftTypeEnum } from '../../../../modules/nfts/enums/nft-type.enum';

export const parseImageUrl = (url: string) => (
  _.replace(url, /(ipfs:\/\/ipfs\/)|(ipfs:\/\/)/, 'https://ipfs.infura.io/ipfs/')
);

export const parseDataEventsData = (event: CollectionType): CreateEventsNftDto => {
  const properties = [];
  const stats = [];

  _.forEach(event.urlData.attributes, (att) => {
    switch (att.display_type) {
      case 'boost_number': {
        properties.push({
          key: att.trait_type,
          value: `${att.value}%`,
        });
        break;
      }
      case 'boost_percentage': {
        properties.push({
          key: att.trait_type,
          value: `${att.value}%`,
        });
        break;
      }
      case 'number': {
        properties.push({
          key: att.trait_type,
          value: att.value,
          total: att.max_value || null,
        });
        break;
      }
      default: {
        properties.push({
          key: att.trait_type,
          value: att.value,
        });
      }
    }
  });

  return ({
    name: event.urlData.name,
    image: parseImageUrl(event.urlData.image),
    description: event.urlData.description,
    attributes: event.urlData.attributes,
    url: event.url,
    token_id: _.toNumber(event.eventData.tokenId),
    is_minted: true,
    account: {
      address: event.eventData.to,
    },
    jsonData: event.urlData,
    quantity: 1,
    contractAddress: event.contractAddress,
    type: NftTypeEnum.fixed,
    properties: prepareNftPropertiesForSave(properties),
    stats,
  });
};

export const parseDataEventsListData = (events: CollectionType[]): CreateEventsNftDto[] => {
  return _.map(events, parseDataEventsData);
};

export const parseUrlData = (urlData) => {
  const parsedUrlData = _.cloneDeep(urlData);

  if (_.isNil(parsedUrlData.image)) {
    parsedUrlData.image = parseImageUrl(parsedUrlData.image);
  }
  return parsedUrlData;
};
