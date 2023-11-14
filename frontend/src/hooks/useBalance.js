import { useEffect, useState } from "react";
import { useGlobalState } from "../contexts/Global";
import { getErc20Contract } from "../utils/helpers";

const erc20Addresses = {
  "SWAPP": process.env.REACT_APP_SWAPP_ADDRESS,
  "WETH": process.env.REACT_APP_WETH_ADDRESS,
};

export function useBalance(currency) {
  const { account, library: provider, chainId } = useGlobalState().web3 ?? {};
  const [balance, setBalance] = useState();

  let erc20 = true;
  let token = currency ? currency.toUpperCase() : "ETH";

  if (token === "ETH") erc20 = false;

  useEffect(() => {
    if (!!account && !!provider) {

      let stale = false;

      if (!erc20)
        provider
          .getBalance(account)
          .then((balance) => {
            if (!stale) {
              setBalance(balance);
            }
          })
          .catch(() => {
            if (!stale) {
              setBalance(null);
            }
          });


      if (erc20) {

        const erc20Address = erc20Addresses[token];

        if (!erc20Address) {

          console.log(token, "is not recognized");
          return;
        }

        const erc20Contract = getErc20Contract(provider, erc20Address);

        if (erc20Contract)
          erc20Contract
            .balanceOf(account)
            .then((balance) => {

              if (!stale) {

                setBalance(balance);
              }
            }).catch(() => {

            if (!stale) {

              setBalance(null);
            }
          });
      }

      return () => {
        stale = true;
        setBalance(undefined);
      };
    }
  }, [account, provider, chainId, erc20, token]);
  // ensures refresh if referential identity of library doesn't change across chainIds

  return {
    balance,
  };
}
