import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "../config/contracts";

export function useContract() {
    const { library: provider } = useWeb3React();
    const [marketSolidContract, setNFTMarketSolid] = useState(null);
    const [GOVContract, setGOVContract] = useState(null);
    const [NFT1155PContract, setNFT1155PContract] = useState(null);

    useEffect(() => {
        if (provider) {
            try {
                const signer = provider.getSigner();

                const nftmarketSolidContract = new ethers.Contract(
                    contractAddress.nftMarketSolid,
                    contractAbi.nftMarketSolid,
                    signer,
                );

                const govContract = new ethers.Contract(
                    contractAddress.GOV,
                    contractAbi.GOV,
                    signer,
                );

                const _NFT1155PContract = new ethers.Contract(
                    contractAddress.NFT1155P,
                    contractAbi.NFT1155P,
                    signer,
                );

                setNFTMarketSolid(nftmarketSolidContract);
                setGOVContract(govContract);
                setNFT1155PContract(_NFT1155PContract);
            } catch (error) {
                console.log(error);
            }
        }
    }, [provider]);

    return {
        marketSolidContract,
        GOVContract,
        NFT1155PContract,
    };
}
