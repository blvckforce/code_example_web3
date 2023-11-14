import { useCallback } from "react";
import API from "../services/API";
import Web3 from "web3";
import { useContractsContext } from "../contexts/contracts.context";
import useSignature from './useSignature';
import { useSettings } from "./useSettings";
import { getReferralLink } from "../utils/helpers";

export function useAuctionMethods() {

  const { marketSolidContract, NFT1155PContract } = useContractsContext();
  const { currencyOptions = [] } = useSettings();
  const { buildSignatureHeader, signPurchase } = useSignature();

  const getHighestBid = async (auctionId) => API.getHighestBid(auctionId);

  const makeBid = useCallback(async (nft, amount) => {
    const bidPrice = +amount;
    const minBid = +nft.bid;

    if (!nft.contractAddress) {
      throw new Error("There is no contract address specified in the NFT. Contact the site administration.");
    }

    if (!bidPrice) {
      throw new Error("Enter bid");
    }

    if (bidPrice < minBid) {
      throw new Error(`Minimum bid is: ${minBid} ${nft.currency.toUpperCase()}`);
    }

    const config = await buildSignatureHeader();
    const { signature, nonce } = await signPurchase(nft, amount, nft.currency);

    const data = { amount, currency: nft.currency, signature, nonce };

    const referralLink = getReferralLink();
    if (referralLink) {
      data.referral = referralLink;
    }

    return API.makeBid(nft.id, data, config);
  }, []);

  const getMyBids = async () => API.getMyBids();

  const cancelBid = async (bidId) => {
    const config = await buildSignatureHeader();
    return API.cancelBid(bidId, config);
  };

  const removeFromSale = async (auctionId) => {
    const config = await buildSignatureHeader();
    return API.removeFromSale(auctionId, config);
  };

  const transferNft = useCallback(async (item) => {
    // TODO: refactor transferNft & acceptOfferNft
    try {

      let brokerAddress = '0x0000000000000000000000000000000000000000';
      const { data = null } = await API.getHighestAndFirst(item.id);
      if (item.type === "fixed") {
        const referralLink = getReferralLink();
        if (referralLink) {
          try {
            const { data } = await API.getReferralLinkDataNFT({
              id: item.id,
              ref: referralLink
            }, {});
            if (data?.account?.address) {
              brokerAddress = data.account.address;
            }
          } catch (error) {
            // It makes no sense to prevent the user from making a purchase
            console.error(error);
          }
        }
      } else if (data?.referral?.account?.address) {
        brokerAddress = data.referral.account.address;
      }
      const config = await buildSignatureHeader();
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const price = item.type === "bid" ? web3.utils.toWei(data.amount.toString()) : web3.utils.toWei(item.price.toString());
      const currencyAddress = currencyOptions.find((c) => c.name.toLowerCase() === item.currency.toLowerCase())?.address;
      const brokerFee = Number(item.brokerFee) * 10;
      const saleType = item.type === "bid" ? 1 : 0;
      const sender = item.type === "bid" ? window.ethereum.selectedAddress : item.account.address;
      const recipient = item.type === "bid" ? data.bidder_address : window.ethereum.selectedAddress;
      const signature = item.type === "bid" ? data.signature : item.signature;
      const nonce = item.type === "bid" ? Number(data.nonce) : Number(item.nonce);
      const amount = item.quantity ? Number(item.quantity) : 1;
      const marketSolidContractTx = await marketSolidContract.finishSale(
        [Number(item.id), Number(item.token_id), brokerFee, price, 1, amount, nonce, saleType],
        [sender, process.env.REACT_APP_NFT1155P_ADDRESS, brokerAddress, recipient, currencyAddress],
        signature,
      );
      await marketSolidContractTx.wait();

      const response = await API.transferNFT({
        id: item.id,
        account: data?.bidder_id, // TODO: move to backend
        accountId: data?.bidder_id, // TODO: move to backend
        on_sale: false,
      }, config);
      return {
        savedItem: response?.data,
        transaction: marketSolidContractTx,
      };
    } catch (error) {
      console.error(error);
    }
  }, [buildSignatureHeader, currencyOptions, marketSolidContract]);

  const acceptOfferNft = useCallback(async (offerId) => {
    // TODO: refactor transferNft & acceptOfferNft
    try {

      if (!offerId) {
        throw new Error('Offer not found');
      }
      const { data = null } = await API.getOffer(offerId);
      const nft = data.nft;

      let brokerAddress = '0x0000000000000000000000000000000000000000';
      const config = await buildSignatureHeader();
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const price = web3.utils.toWei(data.amount.toString());
      const currencyAddress = currencyOptions.find((c) => c.name.toLowerCase() === data.currency.toLowerCase())?.address;
      const brokerFee = Number(nft.brokerFee) * 10;
      const saleType = 1;
      const sender = window.ethereum.selectedAddress;
      const recipient = data.account.address;
      const signature = data.signature;
      const nonce = Number(data.nonce);
      const amount = 1;
      const marketSolidContractTx = await marketSolidContract.finishSale(
        [Number(nft.id), Number(nft.token_id), brokerFee, price, 1, amount, nonce, saleType],
        [sender, process.env.REACT_APP_NFT1155P_ADDRESS, brokerAddress, recipient, currencyAddress],
        signature,
      );
      await marketSolidContractTx.wait();

      const response = await API.acceptOffer({
        id: nft.id,
        account: data?.bidder_id, // TODO: move to backend
        accountId: data?.bidder_id, // TODO: move to backend
        on_sale: false,
        offerId,
      }, config);
      return {
        savedItem: response?.data,
        transaction: marketSolidContractTx,
      };
    } catch (error) {
      console.error(error);
    }
  }, [buildSignatureHeader, currencyOptions, marketSolidContract]);


  const getBidsCount = async (auctionId) => API.getBidsCount(auctionId);

  const putOnSale = useCallback(async (item, tokenId) => {
      if (!item.contractAddress) {
        throw new Error('NFT does not have a contract address, so it cannot be put up for sale. Contact the site administration.');
      }
      let nonce = 0;
      let signature = "";
      if (item.type.toLowerCase() === "fixed") {
        // only fixed price
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        nonce = Date.now();
        // const price = item.price ? web3.utils.toWei(item.price.toString()) : web3.utils.toWei(item.bid.toString());
        const price = web3.utils.toWei(item.price.toString());
        const brokerFee = +item?.brokerFee * 10 || 0; //50 - 5%

        const hash = web3.utils.soliditySha3(
          { t: "address", v: process.env.REACT_APP_NFT1155P_ADDRESS },
          { t: "uint256", v: tokenId },
          { t: "uint256", v: price },
          { t: "uint256", v: 1 }, // amount
          { t: "uint256", v: nonce },
          { t: "address", v: item.contractAddress },
          { t: "uint256", v: brokerFee },
        ).toString("hex");
        const account = window.ethereum.selectedAddress;
        signature = await web3.eth.personal.sign(hash, account);
      }
      /////////////////////////////////////////////////////////
      const approveMethod = NFT1155PContract.setApprovalForAll;
      const approveParams = [
        // address operator
        item.contractAddress,
        // bool approved
        true,
      ];
      const tx = await approveMethod(...approveParams);
      await tx.wait();

      const { data = null } = await API.putOnSale({ item, signature, nonce });
      return data;
    },
    [NFT1155PContract],
  );

  return {
    removeFromSale,
    makeBid,
    transferNft,
    acceptOfferNft,
    cancelBid,
    getMyBids,
    getHighestBid,
    getBidsCount,
    putOnSale,
  };

}
