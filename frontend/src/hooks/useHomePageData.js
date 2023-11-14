import { useEffect, useState } from 'react';
import {
  getArtist,
  getBestCollections,
  getHotNFTs,
  getHottestBids,
  getLiveAuctions,
  getUpcomingDrop,
} from '../utils/home-page';


export const HOME_KEYS = {
  HOT_NFTS: "HOT_NFTS",
  BIDS: "BIDS",
  ARTISTS: "ARTISTS",
  COLLECTIONS: "COLLECTIONS",
  AUCTIONS: "AUCTIONS",
  UPCOMING_DROP: "UPCOMING_DROP",
};

const getData = (key) => {

  switch (key) {

    case HOME_KEYS.HOT_NFTS:
      return getHotNFTs;

    case HOME_KEYS.BIDS:
      return getHottestBids;

    case HOME_KEYS.ARTISTS:
      return getArtist;

    case HOME_KEYS.COLLECTIONS:
      return getBestCollections;

    case HOME_KEYS.AUCTIONS:
      return getLiveAuctions;

    case HOME_KEYS.UPCOMING_DROP:
      return getUpcomingDrop;

    default :
      return async () => undefined;
  }

};


export default function useHomePageData(key) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    (async () => {
      setLoading(true);
      const loadData = getData(key);
      try {
        const response = await loadData();
        if (response) setData(response);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }

    })();

  }, [key]);


  return {
    data, loading,
  };
}
