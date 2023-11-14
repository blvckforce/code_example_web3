import NAVIGATE_ROUTES from './routes';

const host = window.location.host || 'nft.swapp.ee/';

const config = {
  host,
  createItem: {
    /* royalty */
    minRoyalty: 1,
    maxRoyalty: 15,
    /* broker fee */
    minBrokerFee: 0,
    maxBrokerFee: 10,

    maxPriceLength: 12,
    /* bio */
    minBioLength: 1,
    maxBioLength: 250,
    /* Properties, Stats */
    maxPropertyNameLength: 100,
    maxPropertyValueLength: 5,

    maxValidPeriodInDays: 60,
  },

  minAgentFee: 0.1,
  agentFeeStep: 0.01,
  defaultAgentFee: 17.5,
  maxAgentFee: 25,

  profile: {
    maxNameLength: 100,
    maxLinkLength: 100,
  },

  customArtistUrlPrefix: `${host}${NAVIGATE_ROUTES.PROFILE}/`,

  inviteAgent: {
    minSubjectLength: 5,
    maxSubjectLength: 50,
    minMessageLength: 10,
    maxMessageLength: 255,
  },

  artist: {
    maxNameLength: 100,
    maxArtKindsLength: 100,
    aboutLength: 255,
  },

  // mime types according to https://docs.w3cub.com/http/basics_of_http/mime_types/complete_list_of_mime_types
  upload: {

    // temporarily disabled for service reasons
    multiple: false,
    multipleLimit: 6,

    formats: (process.env.REACT_APP_UPLOAD_IMG_FORMATS ?? ".gif,.jpg,.png,.mp4").split(","),
    types: (process.env.REACT_APP_UPLOAD_IMG_FORMATS ?? ".gif,.jpg,.png,.mp4").split(","),
    maximumSize: 100, /* in MB */
  },

  collection: {
    urlPrefix: `${host}${NAVIGATE_ROUTES.COLLECTION_VIEW}/`,
    imageTypes: ".jpg,.gif,.webp,.png",
    maxFileSize: process.env.REACT_APP_FILE_UPLOAD_LIMIT || 5,
    colorVisible: false
  },
  numberInputsDecimalsScale: 3,

  baseCurrency: "swapp",
  supportedExchanges: ["usd", "eth"],

  currencyList: {
    swapp: {
      id: 1,
      name: "SWAPP",
      originalName: "swapp",
      address: process.env.REACT_APP_SWAPP_ADDRESS,
    },
    // ether: {
    //   id: 2,
    //   name: "ETH",
    //   originalName: "ether",
    //   address: process.env.REACT_APP_ETHER_ADDRESS,
    // },
    weth: {
      id: 3,
      name: "WETH",
      originalName: "weth",
      address: process.env.REACT_APP_WETH_ADDRESS,
    },
  },
};

export default config;
