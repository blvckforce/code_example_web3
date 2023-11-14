import { find, map, assignIn } from "lodash-es";
import qs from "qs";
import moment from "moment";
import { ethers } from "ethers";
import { API_PARAMS } from '../config/API_ROUTES';
import { contractAbi } from "../config/contracts";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UnsupportedChainIdError } from "@web3-react/core";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorFrame } from "@web3-react/frame-connector";
import { AccountServices } from "../services/API";
import config from "../config";

export const currencyOptions = Object.values(config.currencyList);

/***
 *
 * @param {string} text
 * @return {Promise<void>}
 */
export async function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export const getFilePath = (file, onSuccess, onError) => {

  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    onSuccess(reader.result);
  };
  reader.onerror = (error) => {
    onError(error);
    console.log("Error: ", error);
  };
  //return URL.createObjectURL(file)
};

export const getFilePathBlob = (file) => {

  return URL.createObjectURL(file);
};

const defaultAvatar = "/images/content/avatar.png";

export const backendUrl = (path, avatar = false) => {

  // TODO: remove this method
  // if (!path) {
  //   return avatar ? defaultAvatar : path;
  // }
  //
  // let base = process.env.REACT_APP_STRAPI_BACKEND_URL;
  //
  // if (!path.startsWith(base))
  //   return `${base}${path}`;

  return path;
};

export const queryString = (queryObject, options) => {

  return qs.stringify(queryObject, options);
};

export const filtersToQueryParams = (filters) => {
  const query = {};
  let priceParams = "";
  let whereParams = "";
  if (filters) {

    Object.entries(filters).forEach(([key, dataObj = {}] = []) => {

      // unique behavior for price range
      if (key === API_PARAMS.PRICE) {
        const splitted = dataObj[API_PARAMS.PRICE]?.split(":");
        const currency = splitted[0];
        const range = splitted[1].trim().split("-").map((x) => parseFloat(x.trim()));

        priceParams = `currency=${currency}&priceMin=${range[0]}${range[1] ? `&priceMax=${range[1]}` : ""}`;

      } else {
        const _array = Object.keys(dataObj);
        if (dataObj[_array[0]]?.parent === undefined) {
          query[key] = _array;
        } else {
          _array.forEach((dataKey) => {
            const { parent } = dataObj[dataKey] ?? {};

            query[key] = query[key]
              ? query[key][parent]
                ? { ...query[key], [parent]: query[key][parent].concat(dataKey) }
                : { ...query[key], [parent]: [dataKey] }
              : { [parent]: [dataKey] }; // !
          });
        }
      }
    });
  }
  whereParams = qs.stringify(
    query, { indices: false },
  );

  // whereParams = qs.stringify(query, { indices: false });

  if (priceParams || whereParams) {

    // whereParams = whereParams ? `_where=${whereParams}` : "";
    return [priceParams, whereParams].filter(i => !!i).join("&");
  }
  return "";
};


export const printWallatAddress = (account) => {
  return account === null
    ? "-"
    : account
      ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
      : "";
};

export const getObjectValue = (data, key, valueKey, value) => {

  if (!data)
    return;

  if (!value)
    return;

  if (!Array.isArray(data))
    return;

  let keyValue;

  for (let index = 0; index < data.length; index++) {

    const row = data[index];

    if (row[valueKey] && row[valueKey].toString().toLowerCase() == value.toString().toLowerCase()) {

      keyValue = row[key];
      continue;
    }
  }
  return keyValue;

};

export const printDate = (dateString, format = 1) => {

  let date = new Date(dateString);
  if (!isNaN(date.getTime()))
    return date.toISOString().replace(/T/, ", ").replace(/\..+/, "").replaceAll("-", ".");

  return dateString;
};

/***
 *
 * @param startDate milliseconds
 * @param durationTime milliseconds
 *
 * @returns [number, number, number, number] || []
 */

export const getTimeLeftForTimer = (startDate, durationTime) => {

  const currentTime = Date.now();
  const endDate = new Date(startDate + durationTime);

  if (endDate < currentTime) {
    return [];
  }
  const diffTime = endDate - currentTime;

  const duration = moment.duration(diffTime, "milliseconds");

  const daysLeft = duration.days();
  const hoursLeft = duration.hours();
  const minutesLeft = duration.minutes();
  const secondsLeft = duration.seconds();

  return [daysLeft, hoursLeft, minutesLeft, secondsLeft];
};

export const getTimeLeft = (currentDate, startTime, durationTime) => {

  const endDate = new Date(startTime + (durationTime));

  if (currentDate > endDate) {
    return [];
  }

  const diffTime = endDate - currentDate;

  const duration = moment.duration(diffTime, "milliseconds");

  const daysLeft = duration.days();

  if (daysLeft) {
    return `${daysLeft} days `;
  }

  const hoursLeft = duration.hours();

  if (hoursLeft) {
    return `${hoursLeft} hours `;
  }

  const minutesLeft = duration.minutes();

  if (minutesLeft) {
    return `${minutesLeft} minutes`;
  }
};

export const convertCurrency = (currency) => find(
  currencyOptions,
  ({ address, name }) => address === currency || name === currency)?.originalName || config.baseCurrency;

/**
 *
 * @param timeInMilliSeconds - MilliSeconds
 * @returns {number} - milliseconds for utc
 */
export const toUTCTimeInMilliseconds = (timeInMilliSeconds) => {
  return timeInMilliSeconds;
  // + (new Date().getTimezoneOffset() * 60 * 1000);
};

/**
 *
 * @param timeInSeconds - milliseconds
 * @returns {number} - milliseconds for utc
 */
export const toLocalTimeInMilliseconds = (timeInSeconds) =>
  +timeInSeconds;

export function parseEventData(data, ix) {
  let six = ix * 64 + 2;
  let eix = six + 64;
  return data.slice(six, eix);
}

export const fromNowShorthand = (lastTime) => {

  let timeToNow = moment(lastTime).fromNow();

  timeToNow = timeToNow.replace("minutes", "min");
  timeToNow = timeToNow.replace("seconds", "sec");

  return timeToNow;
};

const filters = ["default", "collection"];

const stringContains = (string, items = []) => {
  if (typeof string === "string") {
    return items.every(item => string.toLowerCase().includes(item.toLowerCase()));
  }
  return false;
};

export const filterDefaultCollection = (collections = []) => {

  if (Array.isArray(collections)) {
    return collections.filter(({ name, token }) => {
        if (token === "default_collection") return false;
        if (typeof name === 'string') {
          return !(stringContains(name, filters));
        }
        return true;
      },
    );
  }
  return [];
};

export const convertOneNFT = (nft, currentDate) => {
  nft.currency = convertCurrency(nft.currency);
  if (nft.type === "bid") {
    const startTime = toLocalTimeInMilliseconds(nft.start_date);
    const durationTime = nft.durationTime;
    const startDate = new Date(startTime);

    let startDateMessage = "";
    let timeLeft = "";

    if (currentDate > startDate) {
      timeLeft = getTimeLeft(currentDate, startTime, durationTime);
    } else {
      startDateMessage = `Start on ${moment(startTime).format("lll")}`;
    }

    assignIn(nft, {
      startTime,
      startDateMessage,
      durationTime,
      timeLeft,
    });
  }
  return nft;
};

export const convertNFTData = (nfts) => {
  const currentDate = new Date();
  return map(nfts, (nft) => convertOneNFT(nft, currentDate));
};

export function getErc20Contract(provider, token_address = process.env.REACT_APP_SWAPP_ADDRESS) {
  let erc20Contract = null;

  if (provider) {
    try {
      const signer = provider.getSigner();
      erc20Contract = new ethers.Contract(token_address, contractAbi.ERC20, signer);
    } catch (error) {
      console.log(error);
    }
  }

  return erc20Contract;
}

export const getErrorMessage = (error) => {
  if (error instanceof NoEthereumProviderError) {

    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {

    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    error instanceof UserRejectedRequestErrorFrame
  ) {

    return "Please authorize this website to access your Ethereum account.";
  } else {

    if (error.message)
      return error.message;

    console.log(error);
    return "An unknown error occurred. Check the console for more details.";
  }
};

export const logoutUserProfile = async () => {
  const resp = await AccountServices.logout();

  if (resp.error) //not successful return
    return;

  return resp.data;

};

/***
 *
 * @param str - href or unicode smile from BE
 * @return {boolean} - image link matching
 */
export const parseImageOrSmile = (str) => {
  const RegExp = /^http(s)?:\/\//;

  return typeof str === "string" && RegExp.test(str);
};


export const filterNonUserCollections = (collections, account) => {

  if (Array.isArray(collections) && account !== undefined) {
    return collections.filter(({ account: acc } = {}) => acc?.address?.toLowerCase() === account.toLowerCase());
  }

  return [];
};

/***
 * @typedef {number|string} T
 * @param {T[]} array
 * @param {T} value
 * @param {(() => void)| undefined} onAdd
 * @param {(() => void) | undefined} onDelete
 * @return {T[]}
 */
export const switchUniqueValueInArray = (array, value, onAdd, onDelete) => {

  if (!Array.isArray(array)) throw new Error('Should be an array type');

  const _temp = new Set(array);

  if (_temp.size !== array.length) {
    if (process.env.NODE_ENV === 'development') throw new Error('Items in array is not unique');
  }

  if (_temp.has(value)) {
    if (typeof onDelete === 'function') onDelete();
    return array.filter(i => i !== value);
  }

  if (!_temp.has(value)) {
    if (typeof onAdd === 'function') onAdd();
    return array.concat(value);
  }

  return [];
};


export const switchObjectValueInArray = (array, object) => {

  if (!Array.isArray(array)) throw new Error('Should be an array type');

  const filtered = array.filter(i => JSON.stringify(i) !== JSON.stringify(object));
  if (filtered.length !== array.length) return filtered;

  return array.concat(object);
};

export const switchObjectInObject = (object, key, value) => {
  if (object && typeof object === 'object') {
    if (object[key] === undefined) return ({ ...object, [key]: value });
    if (object[key] !== undefined) {
      const { [key]: $, ...rest } = object;
      return rest;
    }
  }
  return object;
};

/**
 *
 * @returns {string|undefined}
 */
export const getReferralLink = () => {
  const urlParams =  new URLSearchParams(window.location.search);
  return urlParams.get('ref') || undefined;
}
