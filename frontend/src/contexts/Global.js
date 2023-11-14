import toast, { Toaster } from "react-hot-toast";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useWallet from "../hooks/useWallet";

import { ConnectorByNames } from "../utils/connectors";
import { getErrorMessage } from "../utils/helpers";

const GlobalContext = createContext({
  web3: null,
  activatingConnector: null,
  setActivatingConnector: null,
  account: null,
  connectWallet: null,
  connectorName: null,
});

const GlobalProvider = ({ children }) => {
  const context = useWeb3React();

  const [activatingConnector, setActivatingConnector] = useState(false);
  const { wallet } = useWallet();
  const [connectorName, setConnectorName] = useState(wallet);
  const {
    account,
    activate,
    error,
  } = context;

  const connectWallet = async (connectorName) => {
    const connector = ConnectorByNames[connectorName];

    if (!window?.ethereum) {
      toast.error(
        "Please install Metamask and refresh page!",
        { position: "top-center", duration: 10000 },
      );
      return;
    }

    if (connector) {
      setConnectorName(connectorName);
      setActivatingConnector(connector);
      await activate(connector);
    } else {
      toast.error("Wallet is not available");
    }
  };

  //react to error change
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    }
  }, [error]);

  return (
    <GlobalContext.Provider
      value={{
        web3: context,
        activatingConnector,
        setActivatingConnector,
        account,
        connectWallet,
        connectorName,
      }}
    >
      <Toaster position='top-left' />
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobalState = () => {
  return useContext(GlobalContext);
};
export { GlobalProvider, useGlobalState };
