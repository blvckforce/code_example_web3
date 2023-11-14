import toast from "react-hot-toast";
import API_ROUTES, { ACCOUNT_PATHS, API_PARAMS, OFFERS_PATHS } from "../config/API_ROUTES";
import STORE_KEYS from '../config/store-keys';
import http from "../utils/http";

/**
 * Base crud class for interacting with strapi backend
 */
class API {

  entity;
  notify;
  throwError;

  constructor() {

  }

  init(entity, config = { notify: true, throwError: false }) {
    this.entity = entity;
    this.notify = config.notify;
    this.throwError = config.throwError;
    this.cancelToken = config.cancelToken;
    return this;
  }

  request() {
    return http;
  }

  _errorWrapper(error, notify = true) {

    let defaultError = { error: error?.response?.statusText, message: error.message };
    let resp = error?.response?.data ? error.response.data : defaultError;

    if (typeof resp == "string") {

      resp = { ...defaultError, ...{ message: resp } };
    }

    if (!resp.error)
      resp.error = true;

    if (!resp.message)
      resp.message = error.message || error;

    //api response error such as validation
    if (resp?.data?.errors) {

      resp.message = resp.message + ": ";

      try {

        let errorsString = [];
        Object.values(resp.data.errors).forEach((er) => {

          errorsString.push(er.message);
        });

        if (errorsString.length)
          resp.message = errorsString.join(",");

      } catch (error) {

        resp.message = resp.message + JSON.stringify(Object.values(resp.data.errors));
      }

    }

    if (notify && this.notify)
      toast.error(resp.message);

    if (this.throwError)
      throw new Error(resp);

    return resp;
  }

  _responseWrapper(resp) {
    return {
      data: resp.data,
      status: resp.status,
    };
  }

  async getAll(params = "") {

    try {
      const resp = await http.get(`/${this.entity}${params}`, { cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  async get(id) {

    try {
      const resp = await http.get(`/${this.entity}/${id}`, { cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  async post(endpoint, data, config) {

    try {
      const resp = await http.post(`/${this.entity}/${endpoint}`, data, { ...config, cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  async search(data) {

    try {
      const resp = await http.post(`/${this.entity}/${API_ROUTES.SEARCH}`, data, { cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  async create(data, config = null) {

    try {

      const resp = await http.post(`/${this.entity}`, data, { ...config, cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {

      return this._errorWrapper(error);
    }
  }

  async update(id, data, config) {

    try {

      const resp = await http.put(`/${this.entity}/${id}`, data, { ...config, cancelToken: this.cancelToken });
      return this._responseWrapper(resp);
    } catch (error) {

      return this._errorWrapper(error);
    }
  }

  delete(id, config) {

    return http.delete(`/${this.entity}/${id}`, { ...config, cancelToken: this.cancelToken });
  }

}


/**
 * Class for managint account entity api calls
 */
class Account extends API {

  constructor(entity, config) {

    super();
    this.init(entity, config);
  }

  async connect(data) {

    try {
      const resp = await http.post(`/${API_ROUTES.AUTH}/${API_ROUTES.CONNECT}`, data);
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  /**
   * Get account nonce
   *
   * @param {string} address
   * @returns Object
   */
  async getNonce(address) {

    try {
      const resp = await http.get(`/${API_ROUTES.AUTH}/${address}/${API_ROUTES.NONCE}`);
      return this._responseWrapper(resp);
    } catch (error) {
      return this._errorWrapper(error);
    }
  }

  /**
   * auth user account using address and signed message
   *
   * @param {object} data
   * @param {hash} signature
   * @returns
   */
  async auth(data) {
    try {

      const resp = await http.post(`/${API_ROUTES.AUTH}/${API_ROUTES.LOGIN}`, data);
      return this._responseWrapper(resp);
    } catch (error) {

      return this._errorWrapper(error);
    }
  }

  async uploadFile(id, data, config) {

    try {

      const resp = await http.post(`/${this.entity}/${id}/${API_ROUTES.UPLOAD_FILE}`, data, config);
      return this._responseWrapper(resp);
    } catch (error) {

      return this._errorWrapper(error);
    }
  }

  async logout() {
    try {

      sessionStorage.removeItem(STORE_KEYS.accessToken);
      const resp = await http.get(`/${API_ROUTES.AUTH}/${API_ROUTES.LOGOUT}`);

      return this._responseWrapper(resp);
    } catch (error) {

      return this._errorWrapper(error);
    }
  }

  verifyTweet(tweetUrl, searchText, config) {

    return this.post(API_ROUTES.VERIFY_TWEET, { url: tweetUrl, token: searchText }, config);
  }

  notifications(params = "") {

    return http.get(`/${API_ROUTES.NOTIFICATIONS}`);
  }

  unreadNotificationsList(params = "") {

    return http.get(`/${API_ROUTES.NOTIFICATIONS}/unread${params}`);
  }

  markAsRead(id) {
    return http.put(`/${API_ROUTES.NOTIFICATIONS}/${id}`);
  }

  async archive(id) {
    return http.put(`/${API_ROUTES.NOTIFICATIONS}/${API_ROUTES.ARCHIVE_NOTIFICATION(id)}`);
  }

  async archiveAllRelated(id) {
    return http.put(`/${API_ROUTES.NOTIFICATIONS}/${API_ROUTES.ARCHIVE_RELATED_NOTIFICATION(id)}`);
  }

  createAgentAccount(address, data, config) {
    return http.post(`/${this.entity}/${API_ROUTES.CREATE_AGENT(address)}`, data, config);
  }

  async get(idSlug, config, notify) {
    try {
      const resp = await http.get(`${this.entity}/${ACCOUNT_PATHS.BY_ID_OR_SLUG}/${idSlug}`, config);
      return this._responseWrapper(resp);
    } catch (e) {
      return this._errorWrapper(e, notify);
    }
  }
}

/**
 * Invite API
 */
class Agency extends API {

  constructor(entity, config) {

    super();
    this.init(entity, config);
  }

  //inivite an artist
  invite(data, config) {

    return this.init(API_ROUTES.INVITES, config).create(data);
  }

  getInvite(token, config) {

    return this.init(API_ROUTES.INVITES, config).get(API_ROUTES.GET_INVITES_BY_TOKEN(token));
  }

  getInviteByToken(token, config) {
    return this.init(API_ROUTES.INVITES, config).get(API_ROUTES.GET_INVITES_BY_TOKEN(token));
  }

  denyAgent(data) {
    return this.init(API_ROUTES.INVITES).post(API_ROUTES.DENY_AGENT, data);
  }

  acceptAgent(data) {
    return this.init(API_ROUTES.INVITES).post(API_ROUTES.ACCEPT_AGENT, data);
  }

  getArtists(params, config) {

    return this.init(API_ROUTES.TEAMS, config).getAll(params);
  }

  message(data, config) {

    return this.init(API_ROUTES.TEAMS, config).post(API_ROUTES.TEAMS_MESSAGE, data);
  }

  getUserAgent(userId, config) {

    return this.init(API_ROUTES.TEAMS, config).get(`?${API_PARAMS.ARTIST}=${userId}`);
  }

  getAgentAccount(agentId, config) {
    return http.get(`/${API_ROUTES.AGENTS}/${API_ROUTES.GET_AGENT_ACCOUNT(agentId)}`);
  }
}

/**
 * General class for fetching data
 */
class General extends API {

  getPeriods(config) {

    return this.init(API_ROUTES.PERIODS, config).getAll();
  }

  getCategories(params, config) {

    return this.init(API_ROUTES.CATEGORIES, config).getAll(params);
  }

  getChains(params, config) {

    return this.init(API_ROUTES.CHAINS, config).getAll(params);
  }

  getMyCollections(config) {
    return this.init(API_ROUTES.MY_COLLECTIONS, config).getAll();
  }

  getCollection(id, config) {
    return this.init(API_ROUTES.COLLECTIONS, config).get(id);
  }

  getCollections(params, config) {
    return this.init(API_ROUTES.COLLECTIONS, config).getAll(params);
  }

  addCollection(data, config) {
    return this.init(API_ROUTES.COLLECTIONS, config).create(data, config);
  }

  updateCollection(id, data, config) {
    return this.init(API_ROUTES.COLLECTIONS, config).update(id, data, config);
  }

  uploadCollectionFile(id, data, config) {
    return this.init(`${API_ROUTES.COLLECTIONS}/${id}/${API_ROUTES.UPLOAD_FILE}`, config).create(data);
  }

  getCollectionProperties(collectionId) {
    return this.init(API_ROUTES.COLLECTIONS).get(`${collectionId}/${API_PARAMS.PROPERTIES}`);
  }

  addNFT(data, config) {
    return this.init(API_ROUTES.NFTS, config).create(data);
  }

  putOnSale(data, config) {
    const { item, signature, nonce } = data;
    const { currency, type, bid, price, start_date, end_date } = item;

    return this.init(API_ROUTES.NFTS).update(API_ROUTES.PUT_ON_SALE(item.id), {
      currency,
      type,
      bid: bid ?? 0,
      price: price ?? 0,
      start_date: start_date ?? 0,
      end_date: end_date ?? 0,
      signature,
      nonce,
    }, config);
  }

  updateNFT(data, config) {
    return this.init(API_ROUTES.NFTS, config).update(data.id, data, config);
  }

  getNFTs(params, config) {

    return this.init(API_ROUTES.NFTS, config).getAll(params);
  }

  getMyNfts(params, config) {
    return this.init(API_ROUTES.MY_NFTS, config).getAll(params);
  }


  getNFTsFromBlockchain(params, config) {

    return this.init(API_ROUTES.NFTS, config).getAll(params);
  }

  getNFTDetails(tokenId, config) {

    return this.init(API_ROUTES.NFTS, config).get(tokenId);
  }

  transferNFT(data, config) {
    return this.init(API_ROUTES.NFTS).update(API_ROUTES.TRANSFER_NFT(data.id), data, config);
  }

  /**
   * @param data {{id: number, ref: string}}
   * @param config
   * @returns {Promise<{data: *, status: *}|{error: *, message: *}|undefined>}
   */
  getReferralLinkDataNFT(data, config) {
    return this.init(API_ROUTES.NFTS).get(API_ROUTES.GET_REFERRAL_LINK_NFT(data.id, data.ref), config);
  }

  /**
   * @param data {{id: number}}
   * @param config
   * @returns {Promise<{data: *, status: *}|{error: *, message: *}|undefined>}
   */
  generateReferralLinkNFT(data, config) {
    return this.init(API_ROUTES.GENERATE_REFERRAL_LINK_NFT(data.id)).create({}, config);
  }

  getUpcomingDrop(params, config) {

    return this.init(API_ROUTES.UPCOMING_DROPS, config).getAll(params);
  }

  getNFTsByCollectionId(collectionID, params, query, config) {


    const urlParams = new URLSearchParams();
    urlParams.append(API_PARAMS.COLLECTION, collectionID);
    if (params) {
      Object.keys(params).forEach(key => {
        urlParams.append(key, params[key]);
      });
    }

    return this.init(API_ROUTES.NFTS, config).getAll(`?${urlParams.toString()}${query ? '&' + query : ''}`);
  }

  getMyNFTsByCollectionId(collectionID, params, config) {

    return this.init(API_ROUTES.MY_NFTS, config).getAll(`?${API_PARAMS.COLLECTION}=${collectionID}${params}`);
  }

  getFeaturedNFTs(params, config) {

    return this.init(API_ROUTES.FEATURED_NFTS, config).getAll(params);
  }

  getLikes(params, config) {

    return this.init(API_ROUTES.LIKES, config).getAll(params);
  }

  getSettings() {

    return this.init(API_ROUTES.GENERAL_SETTINGS, { notify: false, throwError: false }).getAll();
  }


  report(data) {

    return this.init(API_ROUTES.REPORTS).create(data);
  }

  follow(data) {

    return this.init(API_ROUTES.FOLLOWING).create(data);
  }

  unfollow(following_id) {

    return this.init(API_ROUTES.FOLLOWING).delete(following_id);
  }

  followers(params) {

    return this.init(API_ROUTES.FOLLOWING).getAll(params);
  }

  getFollowers(user) {

    return this.init(API_ROUTES.FOLLOWERS).get(`?user=${user}`);
  }

  getFollowing(user) {

    return this.init(API_ROUTES.FOLLOWING).get(`?${API_PARAMS.FOLLOWER}=${user}`);
  }

  getMyBids() {
    return this.init(API_ROUTES.BIDS).get(API_ROUTES.MY_BIDS);
  }

  getHighestAndFirst(auctionId) {
    return this.init(API_ROUTES.NFTS).get(API_ROUTES.HIGHEST_BID(auctionId));
  }

  /***
   *
   * @param auction_id number
   * @param data object { amount number, currency string "ETH", signature string, nonce number }
   * @param config object
   * @returns {Promise<*|undefined>}
   */
  makeBid(auction_id, data, config) {
    return this.init(API_ROUTES.NFTS).update(API_ROUTES.PLACE_BID(auction_id), data, config);
  }

  cancelBid(bidId, config) {
    return this.init(API_ROUTES.BIDS).delete(bidId, config);
  }

  getHighestBid(auctionId) {
    return this.init(API_ROUTES.NFTS).get(API_ROUTES.HIGHEST_BID(auctionId));
  }

  getBidsCount(auctionId) {
    return this.init(API_ROUTES.NFTS).get(API_ROUTES.BID_COUNT(auctionId));
  }

  removeFromSale(auctionId, config) {
    return this.init(API_ROUTES.NFTS).update(API_ROUTES.CANCEL_SALE(auctionId), {}, config);
  }

  /***
   *
   * @param {Object} offer
   * @param {Object} config
   * @return {Promise<*|undefined>}
   */
  makeOffer = (offer, config) => this.init(API_ROUTES.OFFERS).create(offer, config);

  getOffer = (id, config) => this.init(API_ROUTES.OFFERS).get(id, config);
  getOffers = (params = '', config) => this.init(API_ROUTES.OFFERS).get(params, config);

  declineOffer = (offerID, config) => {
    return this.init(API_ROUTES.OFFERS).update(`${offerID}/${OFFERS_PATHS.REJECT}`, config);
  };

  acceptOffer(data, config) {
    return this.init(API_ROUTES.NFTS).update(API_ROUTES.ACCEPT_OFFER_NFT(data.id), data, config);
  }
}


export const AccountServices = new Account(API_ROUTES.ACCOUNTS, { notify: true });
export const AgentServices = new Agency(API_ROUTES.TEAMS);
export default new General();
