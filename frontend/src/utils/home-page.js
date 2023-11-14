import { map } from 'lodash-es';
import qs from 'qs';
import { COLLECTION_PARAMS, NFT_PARAMS, PAGINATION } from '../config/API_ROUTES';
import { bestCollections, featuredArtists, hotBids, hotNfts } from "../mocks/Mocks";
import API from "../services/API";
import { filterDefaultCollection } from './helpers';

const PAGINATION_DEFAULT_PROPS = {
  [PAGINATION.LIMIT]: 10,
  [PAGINATION.OFFSET]: 0,
};

export const getHotNFTs = async (mock) => {
  if (mock) return hotNfts;

  const params = qs.stringify({
    ...PAGINATION_DEFAULT_PROPS,
    [NFT_PARAMS.STATUS]: NFT_PARAMS.FIXED_PRICE,
    // [NFT_PARAMS.HOT]: true,
  });

  const { data } = await API.getNFTs(`?${params}`);


  if (!data) {
    return [];
  }
  return map(data.items ?? [], (nft) => {
    // TODO change it in future
    nft.tokenId = nft.token_id || nft.id;
    return nft;
  });
};

export const getUpcomingDrop = async () => {
  const upcomingDrops = await API.getUpcomingDrop();
  return upcomingDrops?.data || [];
};

export const getArtist = async (mock) => {

  if (mock) return featuredArtists;

  // FIXME
  const params = qs.stringify({
    ...PAGINATION_DEFAULT_PROPS,
  });

  const res = await API.getFeaturedNFTs(`?${params}`);

  if (!res.data) {
    return [];
  }
  return res.data;
};

export const getHottestBids = async (mock) => {
  if (mock) return hotBids;

  const query = qs.stringify({
    ...PAGINATION_DEFAULT_PROPS,
    [NFT_PARAMS.STATUS]: NFT_PARAMS.FIXED_PRICE,
  });

  const { data } = await API.getNFTs(`?${query}`);
  if (!data) return [];
  return data.items ?? [];
};

export const getLiveAuctions = async () => {
  const query = qs.stringify({
    ...PAGINATION_DEFAULT_PROPS,
    [NFT_PARAMS.STATUS]: NFT_PARAMS.AUCTION,
    [NFT_PARAMS.LIVE_AUCTIONS]: true,
  });

  const { data } = await API.getNFTs(`?${query}`);
  if (!data) return [];
  return data.items ?? [];
};

export const getBestCollections = async (mock) => {
  if (mock) return bestCollections;

  const query = qs.stringify({
    ...PAGINATION_DEFAULT_PROPS,
    [COLLECTION_PARAMS.BEST]: true,
  });


  const { data } = await API.getCollections(`?${query}`);
  if (!data) return [];
  return filterDefaultCollection(data);
};

