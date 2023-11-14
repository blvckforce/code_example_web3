import { HelmetProvider } from 'react-helmet-async';
import useDarkMode from "use-dark-mode";
import React, { useEffect } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ClaimModalProvider } from "../contexts/claimModal.context";
import { CurrencyProvider } from "../contexts/currency.context";
import { ProfileProvider } from "../contexts/profile.context";
import { BuildProviderTree } from "./BuildProviderTree";
import { getLibrary } from "./wallet";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import Watcher from "./components/Watcher";
import { GlobalProvider } from "../contexts/Global";
import { ContractsContextProvider } from "../contexts/contracts.context";
import { SocketContextProvider } from "../contexts/socket.context";

const Providers = BuildProviderTree([
  [Web3ReactProvider, { getLibrary }],
  [ThemeProvider, { theme }],
  GlobalProvider,
  CurrencyProvider,
  ContractsContextProvider,
  HelmetProvider,
  ProfileProvider,
  SocketContextProvider,
  ClaimModalProvider,
]);


export const AppWrappers = ({ children }) => {
  const darkMode = useDarkMode(true);
  useEffect(() => {
    darkMode.enable();
  }, [darkMode]);

  return (
    <Providers>
      <Watcher />
      {children}
    </Providers>
  );
};
