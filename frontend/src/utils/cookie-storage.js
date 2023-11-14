const decode = decodeURIComponent;
const pairSplitRegExp = /; */;

const CookieSameSite = {
  strict: 'strict',
  lax: 'lax',
  none: 'none',
};

/***
 *  @typedef {'strict' | 'lax' | 'none'} CookieSameSite
 *  @typedef {{
 *     domain?: string,
 *     expires?: number,
 *     name: string,
 *     path?: string,
 *     secure?: boolean,
 *     sameSite?: CookieSameSite,
 *     value: string
 *  }} Cookie
 * /

 /***
 * @typedef {'equals'} CookieMatchType
 */

/***
 * @typedef {{
 *      name?: string,
 *      url?: string,
 *      matchType?: CookieMatchType
 *  }} CookieStoreGetOptions
 */

/***
 *  @typedef {{
 *    name: string,
 *    domain?: string,
 *    path?: string
 *  }} CookieStoreDeleteOptions
 *
 */

// Try decoding a string using a decoding function.
/***
 *
 * @param { string } str
 * @param { (((str: string) => string ) | boolean ) } decode
 * @returns {string|*}
 */
function tryDecode(str, decode) {
  try {
    return typeof decode === 'boolean' ? decodeURIComponent(str) : decode(str);
  } catch (e) {
    return str;
  }
}

/***
 * @typedef {{
 *   name?: string,
 *   url?: string,
 *   matchType?: CookieMatchType,
 * }} CookieStoreGetOptions
 */

/***
 * @typedef {{
 *   decode?: boolean
 * }} ParseOptions
 */

/***
 *
 * @typedef {{
 *   name?: string,
 *   value?: string,
 *   domain: string | null,
 *   path?: string,
 *   expires: number | null,
 *   secure?: boolean,
 *   sameSite?: CookieSameSite,
 * }} CookieListItem
 */

/***
 * @typedef {CookieListItem[]} CookieList
 */

/***
 * @typedef {{
 *   changed: CookieList,
 *   deleted: CookieList
 * }}  CookieChangeEventInit & EventInit
 */


/**
 * Parse a cookie header.
 * @param { string } str
 * @param { ParseOptions } options
 * @return { Cookie[] }
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
function parse(str, options = {}) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  const obj = [];
  const opt = options || {};
  const pairs = str.split(pairSplitRegExp);
  const dec = opt.decode || decode;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    let eqIdx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eqIdx < 0) {
      continue;
    }

    const key = pair.substr(0, eqIdx).trim();
    let val = pair.substr(++eqIdx, pair.length).trim();

    // quoted values
    if ('"' === val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (typeof obj[key] === 'undefined') {
      obj.push({
        name: key,
        value: tryDecode(val, dec),
      });
    }
  }

  return obj;
}

class CookieStore {

  get [Symbol.toStringTag]() {
    return 'CookieStore';
  }

  constructor() {
    throw new TypeError('Illegal Constructor');
  }

  /***
   *
   * @param { CookieStoreGetOptions['name'] | CookieStoreGetOptions } init
   * @return { Cookie | undefined }
   */
  get(init) {
    if (!init) {
      throw new TypeError('CookieStoreGetOptions must not be empty');
    } else if (init instanceof Object && !Object.keys(init).length) {
      throw new TypeError('CookieStoreGetOptions must not be empty');
    }
    return (this.getAll(init))[0];
  }

  /***
   *
   * @param { CookieListItem | string }  init
   * @param { string? } possibleValue
   * @return { void }
   */
  set(init, possibleValue) {
    const item = {
      name: '',
      value: '',
      path: '/',
      secure: false,
      sameSite: CookieSameSite.strict,
      expires: null,
      domain: null,
    };
    if (typeof init === 'string') {
      item.name = init;
      item.value = possibleValue;
    } else {
      Object.assign(item, init);
      if (typeof window === 'undefined') {
        throw new Error('Window is not defined');
      }

      if (item.path && !item.path.startsWith('/')) {
        throw new TypeError('Cookie path must start with "/"');
      }
      if (item.domain?.startsWith('.')) {
        throw new TypeError('Cookie domain cannot start with "."');
      }
      if (item.domain && item.domain !== this.window.location.hostname) {
        throw new TypeError('Cookie domain must domain-match current host');
      }
      if (item.name === '' && item.value && item.value.includes('=')) {
        throw new TypeError(
          "Cookie value cannot contain '=' if the name is empty",
        );
      }

      if (item.path && item.path.endsWith('/')) {
        item.path = item.path.slice(0, -1);
      }
      if (item.path === '') {
        item.path = '/';
      }
    }

    let cookieString = `${item.name}=${encodeURIComponent(item.value)}`;

    if (item.domain) {
      cookieString += '; Domain=' + item.domain;
    }

    if (item.path && item.path !== '/') {
      cookieString += '; Path=' + item.path;
    }

    if (typeof item.expires === 'number') {
      cookieString += '; Expires=' + new Date(item.expires).toUTCString();
    }

    if (item.secure) {
      cookieString += '; Secure';
    }

    switch (item.sameSite) {
      case CookieSameSite.lax:
        cookieString += '; SameSite=Lax';
        break;
      case CookieSameSite.strict:
        cookieString += '; SameSite=Strict';
        break;
      case CookieSameSite.none:
        cookieString += '; SameSite=None';
        break;
      default:
        break;
    }

    window.document.cookie = cookieString;
  }

  /***
   *
   * @param {(CookieStoreGetOptions['name'] | CookieStoreGetOptions)? } init
   * @return { Cookie[] }
   */
  getAll(init) {
    const cookies = parse(document.cookie);
    if (!init || Object.keys(init).length === 0) {
      return cookies;
    }

    if (init instanceof Object && !Object.keys(init).length) {
      throw new TypeError('CookieStoreGetOptions must not be empty');
    }
    let name;
    let url;
    if (typeof init === 'string') {
      name = init;
    } else {
      name = init.name;
      url = init.url;
    }
    if (url) {
      const parsedURL = new URL(url, window.location.origin);
      if (
        window.location.href !== parsedURL.href ||
        window.location.origin !== parsedURL.origin
      ) {
        throw new TypeError('URL must match the document URL');
      }
      return cookies.slice(0, 1);
    }
    return cookies.filter((cookie) => cookie.name === name);
  }

  /***
   *
   * @param {(CookieStoreDeleteOptions['name'] | CookieStoreDeleteOptions)} init
   * @return { void }
   */
  delete(init) {
    const item = {
      name: '',
      value: '',
      path: '/',
      secure: false,
      sameSite: CookieSameSite.strict,
      expires: null,
      domain: null,
    };
    if (typeof init === 'string') {
      item.name = init;
    } else {
      Object.assign(item, init);
    }

    item.expires = 0;

    this.set(item);
  }
}


export const cookieStore = Object.create(CookieStore.prototype);
