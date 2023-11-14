import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../services/API';
import qs from 'qs';
import useSignature from './useSignature';

export const OFFER_STATUS = {
  ACTIVE: 'ACTIVE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
};

/***
 * @typedef {{
 *  accountId: number,
 *  amount: number,
 *  currency: string,
 *  endedAt: string,
 *  id: number,
 *  nft: Object,
 *  nftId: number,
 *  nonce: string,
 *  signature: string,
 *  status: Status
 * }} Offer
 * */

/***
 * @param { boolean } isOwner
 * @param { number! } itemId
 * @return {{offers: Offer[],
 * denyOffer: (function(offerID: number): Promise<void>),
 * acceptOffer: (function(offerID: number): Promise<void>),
 * updateOffers: ((function(offerID: number): Promise<void>)|*), loading: boolean}}
 */
export default function useMakeOfferMethods(isOwner, itemId) {

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const req = useRef({});

  const { buildSignatureHeader, signPurchase } = useSignature();


  /***
   *
   * @typedef {'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' | 'EXPIRED'} Status

   * @type {
   * function({
   *          nftId: number, status : Status,
   *          received: boolean,
   *          cancelToken?: *
   *          }): Promise<Array<Offer>>}
   */
  const getOffers = useCallback(async ({ nftId, status, received, cancelToken }) => {

    const params = qs.stringify({
      nftId,
      status,
      received,
    });

    return API.getOffers(`?${params}`, { cancelToken });
  }, []);

  const updateOffers = useCallback(async (itemId) => {
    if (itemId) {
      try {
        setLoading(true);
        if (req.current?.getOffers) req.current.cancel();

        const cancelToken = axios.CancelToken.source();

        req.current.getOffers = cancelToken;


        const { data } = await getOffers({
          nftId: itemId,
          ...(isOwner && { status: OFFER_STATUS.ACTIVE }),
          received: isOwner,
          cancelToken: cancelToken.token,
        });

        if (data) setOffers(data);
        if (data.error) {
          setOffers([]);
          toast.error(data.error.message || 'Something went wrong');
        }
      } catch (e) {
        console.error(e);
        toast.error('Something went wrong while get offers');
      } finally {
        setLoading(false);
        if (req.current?.getOffers) req.current.getOffers = null;
      }
    }
  }, [getOffers, isOwner]);

  const acceptOffer = useCallback(async (offerID) => {
    return API.acceptOffer(offerID)
      .catch()
      .finally(() => updateOffers(itemId));
  }, [itemId, updateOffers]);

  const denyOffer = useCallback((offerID) => {
    return API.declineOffer(offerID)
      .catch()
      .finally(() => updateOffers(itemId));
  }, [itemId, updateOffers]);


  const makeOffer = useCallback(async (nft, data) => {

    // TODO: refactor
    const amount = +data.amount;

    if (!nft.contractAddress) {
      throw new Error("There is no contract address specified in the NFT. Contact the site administration.");
    }

    if (!amount) {
      throw new Error("Enter amount");
    }

    const config = await buildSignatureHeader();
    const { signature, nonce } = await signPurchase(nft, amount, data.currency);

    return API.makeOffer({
      ...data,
      nftId: nft.id,
      signature,
      nonce,
    }, config);
  }, [buildSignatureHeader, signPurchase]);


  return {
    offers,
    loading,
    updateOffers,
    acceptOffer,
    denyOffer,
    makeOffer,
  };
}
