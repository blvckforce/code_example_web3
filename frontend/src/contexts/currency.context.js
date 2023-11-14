import { createContext, useContext } from "react";
import { useFetchCurrency } from "../hooks/useFetchCurrency";

const CurrencyContext = createContext({
  currencyFetching: false,
  exchange: {},
  update: async () => undefined,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {

  const { currencyFetching, exchange, update } = useFetchCurrency();

  return (
    <CurrencyContext.Provider value={{ currencyFetching, exchange, update }}>
      {children}
    </CurrencyContext.Provider>
  );
};

