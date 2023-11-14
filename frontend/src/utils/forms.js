import { padStart, isFinite, isNaN, replace, toNumber, isNull, forEach, isFunction } from "lodash-es";
import moment from 'moment';
import config from "../config";
import { UPLOAD_MODES } from '../config/routes';

export const formFieldNormaliser = ({ type, event, minValue }) => {

  let value = event.target.value;

  switch (type) {
    case "integer" : {
      value = replace(value, /[^0-9]/g, "");
      if (value?.[0] === "0") {
        value = value.substring(1);
      }
      break;
    }
    case "number": {
      value = trimNotNumbersSymbols(value, minValue);
      break;
    }
    case "date" : {
      value = value.valueOf();
      break;
    }
    default:
      break;
  }

  if (event.target.type === "text" || event.target.type === "textarea") {
    value = trimNonEnglishCharacters(value);
  }
  if (event.target.type === "textarea") {
    value = strMaxLen(value, 255);
  }
  if (event.target.name === "price") {
    value = strMaxLen(value?.toString(), config.createItem.maxPriceLength);
  }

  if (event.target.name === "name") {
    value = strMaxLen(value, config.createItem.maxPropertyNameLength);
  }


  return { name: event.target.name, value };
};


export const callWithTimeout = (callback = () => null, timeout = 0) => {
  const timeOut = setTimeout(() => {
    if (typeof callback === "function") callback();
    (() => {
      clearTimeout(timeOut);
    })();
  }, timeout);
};


export const setEngValueWithLimit = (limit) => (value) => strMaxLen(trimNonEnglishCharacters(value), limit);


export const setNumberValueWithMinvalue = (minValue) => (value) => trimNotNumbersSymbols(value, minValue);


/***
 *
 * @param prefix : string
 * @param limit : number?
 * @return {(function(value: string): (string|undefined))|string}
 */
export const withPrefixAndLimitChange = (prefix, limit) => (value) => {
  value = value.replace(prefix, "");
  if (value) return strMaxLen(trimNonEnglishCharacters(prefix + value), limit);
};

export const withPrefixAndLimitUrlChange = (prefix, limit) => (value) => {
  if (typeof value === 'string') {
    value = value.replace(prefix, '');
    value = trimNotValidUrlSymbols(value);
    if (value) return strMaxLen(trimNonEnglishCharacters(prefix + value), limit);
  }
};

const validNumberFieldRegEx = /^[0-9]*(([,.])[0-9]{0,3}$)?$/;
const semiValidNumberFieldRegEx = /[0-9]*([,.])[0-9]+/;

/***
 *
 * @param value : number|string
 * @return {number|void}
 */
export const numberFieldValidation = (value) => {

  if (typeof value !== 'object' && !isNaN(value)) {
    if (!value) {
      return value;
    }
    if (validNumberFieldRegEx.test(value.toString())) {
      return +value;
    }
    if (value && semiValidNumberFieldRegEx.test(value.toString())) {
      return +((+value).toFixed(config.numberInputsDecimalsScale ?? 3).toString());
    }
  }
};

export const trimNotNumbersSymbols = (value, minValue) => {
  let _value = replace(value, /[^0-9.,]+/g, "");

  if (minValue !== undefined) {
    _value = +_value !== 0 && _value !== "" ? +(numberFieldValidation(_value)) !== 0 ? +(numberFieldValidation(_value)) : minValue : _value;
  } else {
    _value = +_value !== 0 && _value !== "" ? +(numberFieldValidation(_value)) : _value;
  }
  return _value;
};


export const strMaxLen = (string, length) => typeof string === "string" ? string.slice(0, length) : string;

export const trimNonEnglishCharacters = (string = "") => {
  if (typeof string === "string") return string.replace(/[^A-Za-z 0-9 \.,\?"'!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "");
  return string;
};


export const modesList = [UPLOAD_MODES.SINGLE, UPLOAD_MODES.MULTIPLE];

const { minBrokerFee, maxBrokerFee, maxRoyalty, minRoyalty } = config.createItem;

export const getDate = () => `${new Date().getFullYear()}-${padStart(new Date().getMonth(), 2, "0")}-${padStart(new Date().getDay(), 2, "0")}`;

export const validateFields = (form) => {

  if (process.env.NODE_ENV) console.log(form);

  let isFormValid = true;
  const type = form.type;
  const mode = form.mode;

  const validationRulesList = {
    account: {
      validate: (v) => !!v,
      message: "You should be authorized before creating",
    },
    image: {
      validate: (v) => !!v,
      message: "Image is Required",
    },
    name: {
      validate: (v) => !!v,
      message: "Name is Required",
    },
    description: {
      validate: (v) => !!v,
      message: "Description is Required",
    },
    price: {
      disabled: type === "bid",
      validate: (v) => {
        const value = toNumber(v);
        return !isNaN(value)
          && value > 0
          && isFinite(value);
      },
      message: "Price is Invalid",
    },
    quantity: {
      message: "Quantity is Invalid",
      validate: (v) => {
        const value = toNumber(v);
        return !isNaN(value)
        && value > 0
        && isFinite(value)
        && mode === modesList[0]
          ? value === 1
          : value > 1;
      },
    },
    bid: {
      disabled: type !== "bid",
      validate: (v) => {
        const value = toNumber(v);
        return !isNaN(value)
          && value > 0
          && isFinite(value);
      },
      message: "Minimum bid is Invalid",
    },
    type: {
      validate: (v) => !isNull(v),
      message: "Type is Required",
    },
    mode: {
      validate: (v) => !isNull(v),
      message: "Mode is Required",
    },
    category: {
      validate: (v) => !!v,
      message: "Category is Required",
    },
    start_date: {
      disabled: type !== "bid",
      validate: (v) => {
        return v > Date.now();
      },
      message: "STARTING DATE is Invalid",
    },
    end_date: {
      disabled: type !== "bid",
      validate: (v) => {
        const value = toNumber(v);
        return !isNaN(value) && value > 0 && isFinite(value);
      },
      message: "Duration time is Invalid",
    },
    unlockable: {
      validate: () => true,
      message: "Unlockable is invalid",
    },
    sensitive: {
      validate: (v) => !isNull(v),
      message: "Is content sensitive is Required",
    },
    chain: {
      validate: (v) => !!v,
      message: "Chain is Required",
    },
    brokerFee: {
      validate: (v = "") => {
        const value = +v;
        if (!!value || !!minBrokerFee) {
          return !isNaN(value) && (value >= minBrokerFee && value <= maxBrokerFee);
        }
      },
      message: `Broker fee must be between ${minBrokerFee} and ${maxBrokerFee}`,
    },
    royalty: {
      validate: (v = "") => {
        const value = +(v);
        if (!!value || !!minRoyalty) {
          return !isNaN(value) && value >= minRoyalty && value <= maxRoyalty;
        }
      },
      message: `Royalty fee must be between ${minRoyalty} and ${maxRoyalty}`,
    },
    colection: {
      validate: (v) => !!v,
      message: "Collection is Required",
    },
    properties: {
      required: false,
    },
    stats: {
      required: false,
    },
  };

  const errors = {};
  forEach(validationRulesList, ({ validate, message, disabled, required }, property) => {
    if (disabled === true) {
      return;
    }
    if (!isFunction(validate)) {
      return;
    }

    if (required === true) {
      return;
    }

    const isPropertyValid = validate(form[property]);
    if (isPropertyValid === false) {
      errors[property] = message;
      isFormValid = false;
    }
  });

  return { isFormValid, errors };
};

///validate url not to contain special character that could lead to invalid web address
// restrictedUrlSymbols symbols
// spaces " "
// delims "<" | ">" | "#" | "%" | <">
// unwise      = "{" | "}" | "|" | "\" | "^" | "[" | "]" | "`"
// reserved    = ";" | "/" | "?" | ":" | "@" | "&" | "=" | "+" | "$" | ","

// eslint-disable-next-line
export const restrictedUrlSymbols = "<>#%\"'`{}|\\/^[];?:@&=+$,.";
export const restrictedUrlRegExp = /[<>#"'`{}|\\\/\^\[\];?:@&=+$,\s.]*/g;

export const trimNotValidUrlSymbols = (string = '') => {
  if (typeof string === 'string') return string.replace(restrictedUrlRegExp, '');
};

export const getUrlWithPrefixPattern = (prefix = '') => {
  if (typeof prefix === 'string') return new RegExp(prefix + '\\b.*[a-zA-Z]+.*\\b', 'g');
};


export const isValidDay = (day) => {
  return moment(day).startOf("day") >= moment().startOf("day") && moment(day).endOf("day") <= moment(moment().add(config.createItem.maxValidPeriodInDays, "d")).endOf("day");
};
