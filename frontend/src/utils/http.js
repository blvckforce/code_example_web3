import axios from "axios";
import STORE_KEYS from '../config/store-keys';
import { cookieStore } from './cookie-storage';

export const getToken = () => cookieStore.get(STORE_KEYS.accessToken);
export const clearToken = () => cookieStore.delete(STORE_KEYS.accessToken);
export const setToken = (token = '') => cookieStore.set({
  name: STORE_KEYS.accessToken,
  value: token,
  // path: '/',
  sameSite: 'strict',
});

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
    'Access-Control-Allow-Origin': process.env.REACT_APP_BACKEND_URL,
  },
});

axiosInstance.interceptors.request.use((req) => {
  const token = getToken();
  if (token?.value !== undefined) {
    req.headers.Authorization = `Bearer ${token.value}`;
  }
  return req;
});

export default axiosInstance;

/***
 *
 * @param ids : string
 * @param currencies : string
 * @returns {Promise<AxiosResponse<{[id]:{[currency]: number}}>>}
 */
export const getCurrencies = (ids, currencies) => axios.get(
  `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}
  `);

