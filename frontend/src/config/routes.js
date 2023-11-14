const NAVIGATE_ROUTES = {
  HOME: "/home",
  UPLOAD_DETAILS: "/upload-details",
  UPLOAD_VARIANTS: "/upload-variants",
  ITEM_PAGE: "/item",
  AGENT_STATS_PAGE: "/agents",
  SIGN_UP_PAGE: "/agent/register",
  ARTIST_SIGN_UP: "/artist/register",
  ARTIST_VERIFICATION: "/artist/verify",
  INVITATION: "/join",
  FAQ: "/faq",
  NOTIFICATION: "/notification",
  EXPLORE: "/explore",
  MARKET: "/market",
  ACTIVITY: "/activity",
  SEARCH: "/search02",
  PROFILE: "/profile",
  COLLECTION_VIEW: "/collection",
  ACCOUNT_SETTINGS: "/account-settings",
  FOLLOWING: '/profile/following',
};

export const NAVIGATE_PARAMS = {
  PROFILE_ID: 'profileID',
  SELECTED_CATEGORY: 'category',
  COLLECTION_ID: 'collectionID',
  UPLOAD_MODE: 'modeParam',
  NFT_TOKEN_ID: 'nfTtokenID',
  INVITATION_TOKEN: 'token',
  NFT_ID: 'id',
  ACCOUNT_TAB: 'tab',
  PROFILE_TAB: 'profile',
};

export const UPLOAD_MODES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};


export default NAVIGATE_ROUTES;
