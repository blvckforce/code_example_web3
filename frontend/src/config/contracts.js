import NFTMarketSolid from "../abis/NFTMarketSolid.abi.json";
import GOV from "../abis/GOV.abi.json";
import NFT1155P from "../abis/NFT1155P.abi.json";
import ERC20 from "../abis/ERC20.abi.json";

const contractAddress = {
    nftMarketSolid: process.env.REACT_APP_NFT_MARKET_SOLID_ADDRESS,
    GOV: process.env.REACT_APP_NFT_GOV_ADDRESS,
    NFT1155P: process.env.REACT_APP_NFT1155P_ADDRESS,
}

const contractAbi = {
    nftMarketSolid: NFTMarketSolid.abi,
    GOV: GOV.abi,
    NFT1155P: NFT1155P.abi,
    ERC20: ERC20.abi,
};

export {
    contractAddress,
    contractAbi,
};
