import { convertNFTData, convertOneNFT } from "./helpers";
import API, { AccountServices } from "../services/API";

export const NFTRequest = {
  getDetails: async (tokenId, config) => {
    const details = await API.getNFTDetails(tokenId, config);
    if (!details?.data) {
      return false;
    }

    const currentDate = new Date();

    return convertOneNFT(details.data, currentDate);
  },
  getList: async (params, config) => {
    const nftResponse = await API.getNFTsFromBlockchain(params, config);

    if (!nftResponse?.data) {
      return [];
    }

    return convertNFTData(nftResponse.data);
  },
};

/***
 *  @param {{ bidder_address: string,
 *            bidder_id: number,
 *            bitId: number,
 *            created_at : string,
 *            nftId: string }} response - response from BIDS socket
 *  @param id : number - auctionId
 *  @return boolean
 */
export const checkAuctionChanges = (response, id) => {
  return +response.nftId === +id;
};

export const checkCollectionUniqueUri = async (slug = '') => {
  let exists = true;
  try {
    const data = await API.getCollection(slug, { notify: false });
    if (data.statusCode === 404) exists = false;
  } catch (e) {
    console.error(e);
  }

  return { exists };
};

export const checkProfileUniqueUri = async (slug = '', id) => {

  let exists = true;
  try {
    const data = await AccountServices.get(slug, null, false);
    if (data.status === 200) {
      if (data.data?.id === id) exists = false;
    }
    if (data.statusCode === 404) exists = false;

  } catch (e) {
    console.error(e);
  }

  return { exists };
};

export const generateReferralLinkNFT = async (nftId, cancelToken) => API.generateReferralLinkNFT({ id: nftId }, { cancelToken });
