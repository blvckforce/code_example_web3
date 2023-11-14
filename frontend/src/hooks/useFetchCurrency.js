import { useCallback, useEffect, useState } from "react";
import config from "../config";
import { getCurrencies } from "../utils/http";


export const useFetchCurrency = () => {
  const [fetching, setFetching] = useState(false);
  const [exchange, setExchange] = useState({});


  const update = useCallback(async () => {

    try {
      setFetching(true);

      const { data } = await getCurrencies(
        Object.keys(config.currencyList ?? {}).toString(), config.supportedExchanges.toString(),
      );

      setExchange(data);

    } catch (e) {
      console.warn(e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    update().catch();
  }, [update]);

  return {
    currencyFetching: fetching, exchange, update,
  };
};
