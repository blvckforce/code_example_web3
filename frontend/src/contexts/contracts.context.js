import React, { createContext, useContext } from "react";
import { useContract } from "../hooks/useContract";

const ContractsContext = createContext({});

const ContractsContextProvider = ({ children }) => {
    const contracts = useContract();

    return (
        <ContractsContext.Provider value={contracts}>
            {children}
        </ContractsContext.Provider>
    );
};

const useContractsContext = () => {
    return useContext(ContractsContext);
};
export { ContractsContextProvider, useContractsContext };
