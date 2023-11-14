const NFTS_PATH = "nfts";
const COLLECTIONS_PATH = "collections";
const AGENTS_PATH = "agents";

const API_ROUTES = {

  // inits
  NFTS: NFTS_PATH,
  COLLECTIONS: COLLECTIONS_PATH,
  AGENTS: AGENTS_PATH,
  BIDS: "bids",
  TEAMS: "teams",
  LIKES: "likes",
  ARTISTS: "artists",
  UPCOMING_DROPS: "upcoming-drops",
  OFFERS: 'offers',

  MY_NFTS: `${NFTS_PATH}/my/`,
  TRANSFER_NFT: (auctionID) => `${auctionID}/transfer-nft`,
  ACCEPT_OFFER_NFT: (nftId) => `${nftId}/accept-offer`,
  GET_REFERRAL_LINK_NFT: (nftId, ref) => `${nftId}/referral-link/${ref}`,
  GENERATE_REFERRAL_LINK_NFT: (nftId) => `${NFTS_PATH}/${nftId}/referral-link`,

  CATEGORIES: "categories",
  FEATURED_NFTS: "featureds",

  // INVITES
  INVITES: "invites",
  GET_INVITES_BY_TOKEN: (token) => `by-token/${token}`,

  // COLLECTIONS
  MY_COLLECTIONS: `${COLLECTIONS_PATH}/my`,

  // BIDS
  HIGHEST_BID: (auctionId) => `${auctionId}/highest-bid`,
  MY_BIDS: "list/my",
  PLACE_BID: (auctionID) => `${auctionID}/place-bid`,
  BID_COUNT: (auctionId) => `${auctionId}/count-bids`,
  // SALE
  PUT_ON_SALE: (auctionId) => `${auctionId}/put-on-sale`,

  CANCEL_SALE: (auctionId) => `${auctionId}/cancel-sale`,

  // AGENTS
  CREATE_AGENT: (accountAddress) => `${accountAddress}/agent`,
  GET_AGENT_ACCOUNT: (agentId) => `${agentId}`,
  DENY_AGENT: 'deny',
  ACCEPT_AGENT: 'accept',

  //TEAMS
  TEAMS_MESSAGE: "message",
  CHAINS: "chains",
  PERIODS: "periods",
  GENERAL_SETTINGS: "general-settings",

  // accounts
  ACCOUNTS: "accounts",
  FOLLOWING: "follows",
  FOLLOWERS: "follows",
  REPORTS: "reports",

  // NOTIFICATIONS
  NOTIFICATIONS: "notifications",
  ARCHIVE_NOTIFICATION: (notificationId) => `${notificationId}/archive`,
  ARCHIVE_RELATED_NOTIFICATION: (notificationId) => `${notificationId}/archive-all-related`,

  // SERVICES
  UPLOAD_FILE: "upload-file",
  AUTH: "auth",
  LOGIN: "login",
  NONCE: "nonce",
  CONNECT: "connect",
  SEARCH: "search",
  LOGOUT: "logout",
  VERIFY_URL: "verify-url",
  VERIFY_TWEET: "verify-tweet",
  NEWSLETTERS: "newsletters",
};

export const API_PARAMS = {
  ACCOUNT: "account",
  COLLECTION: "collection",
  ARTIST: "artist",
  FOLLOWER: "follower",
  STATUS: "status",
  PRICE: "price",
  CHAIN: "chain",
  CATEGORY: "category",
  PAYMENT_METHOD: "paymentMethod",
  TAGS: "tags",
  PROPERTIES: 'properties',
};

export const PAGINATION = {
  LIMIT: 'limit',
  OFFSET: 'offset',
  SORT: '',
};

export const NFT_PARAMS = {
  STATUS: 'status',
  FIXED_PRICE: 'buy_now',
  AUCTION: 'on_auction',
  LIVE_AUCTIONS: 'live',
  HOT: 'hot',
  NAME_CONTAINS: 'name_contains',
  MINTED: 'is_minted',
};

export const COLLECTION_PARAMS = {
  BEST: 'best',
  PROPERTY: 'property',
};


export const ACCOUNT_PATHS = {
  BY_ID_OR_SLUG: 'by-id-or-slug',
  BY_ID: 'by-id',
};

export const OFFERS_PATHS = {
  CLOSE: 'close',
  REJECT: 'reject',
};

export default API_ROUTES;
