import { FixedNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import Web3 from 'web3';
import { useGlobalState } from '../contexts/Global';
import { getErc20Contract } from '../utils/helpers';
import { getSignature } from '../utils/wallet';
import { useSettings } from './useSettings';

export default function useSignature() {

  // TODO: Use this global state. If you do not use it, then there will be problems with the account address: it will be in lower case, which is unacceptable for the functionality to work correctly.
  const { account, web3 } = useGlobalState();

  const { library: provider } = web3 ?? {};
  const { currencyOptions = [] } = useSettings();

  const buildSignatureHeader = useCallback(async () => {
    if (!provider) {
      toast("Connect wallet to perform this action");
      throw  new Error('Connect wallet to perform this action');
    }
    const signer = provider.getSigner();
    const signature = await getSignature(true, signer, account);
    if (!signature) throw new Error(`Can not get signature`);
    return {
      headers: {
        'x-signature': signature,
      },
    };
  }, [account, provider]);


  const signPurchase = useCallback(async (nft, amount, currency) => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const account = window.ethereum.selectedAddress;
    const currencyAddress = currencyOptions.find((c) => c.name.toLowerCase() === currency.toLowerCase())?.address;


    if (!currencyAddress) {
      throw new Error("Non-existent currency selected");
    }
    const erc20Contract = getErc20Contract(provider, currencyAddress);

    const balance = await erc20Contract.balanceOf(account);

    if (!balance) {
      throw new Error("Balance is empty");
    }
    const convertedTotalBid = ethers.utils.parseUnits(amount.toString(), "ether");
    if (ethers.BigNumber.from(balance).lte(ethers.BigNumber.from(convertedTotalBid))) {
      throw new Error("Insufficient balance");
    }

    try {
      const allowanceTx = await erc20Contract.allowance(account, nft.contractAddress);
      const approved = FixedNumber
        .fromString(formatEther(allowanceTx))
        .toUnsafeFloat();
      if (approved < amount) {
        // TODO: move to env
        const bigNumber = "1157920892373161954235709850086"; //(2^256 - 1 )
        const approveAmount = ethers.utils.parseUnits(bigNumber, "ether");
        const erc20ContractTx = await erc20Contract.approve(nft.contractAddress, approveAmount);
        await erc20ContractTx.wait();
      }
    } catch (error) {
      throw new Error("Something went wrong. Reload the page and try again.");
    }

    const nonce = Date.now();
    const amountWei = web3.utils.toWei(amount.toString());
    const hash = web3.utils.soliditySha3(
      { t: "address", v: process.env.REACT_APP_NFT1155P_ADDRESS },
      { t: "uint256", v: nft.token_id },
      { t: "uint256", v: amountWei },
      { t: "uint256", v: 1 },
      { t: "uint256", v: nonce },
      { t: "address", v: nft.contractAddress },
    ).toString("hex");
    const signature = await web3.eth.personal.sign(hash, account);

    return {
      signature,
      nonce,
    };
  }, [currencyOptions, provider]);


  return {
    buildSignatureHeader,
    signPurchase,
  };
}
