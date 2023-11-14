import React, { useState } from "react";
import cn from "classnames";
import { ethers } from "ethers";
import { useContract } from "../../../../hooks/useContract";
import { useSettings } from "../../../../hooks/useSettings";

import styles from "./Checkout.module.sass";
import Icon from "../../../../components/Icon";
import Loader from "../../../../components/Loader";
import { useGlobalState } from "../../../../contexts/Global";
import { Balance } from "../../../../components/Header/Wallet";
import { useAuctionMethods } from "../../../../hooks/useAuctionMethods";
import { FixedNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { getErc20Contract } from "../../../../utils/helpers";
import Convertor from "../../../../components/Convertor";


const Checkout = ({ className, item, updateItem, serviceFee, onSuccess, onClose }) => {
  const { marketSolidContract } = useContract();
  const { library: provider } = useGlobalState().web3 ?? {};
  const { currencyOptions = [] } = useSettings();

  const [error, setError] = useState();
  const [busy, setBusy] = useState(false);

  const { transferNft } = useAuctionMethods();

  if (!item) {
    return null;
  }

  const total = +item.price + serviceFee;
  const items = [
    {
      title: item.price,
      value: item.currency,
    },
    {
      title: "Your balance",
      value: <Balance className={styles.subtitle}
                      currency={item.currency} />,
    },
    {
      title: "Service fee",
      value: `${serviceFee} ${item.currency?.toUpperCase() ?? ""}`,
    },
    {
      title: "You will pay",
      value: `${total} ${item.currency?.toUpperCase() ?? ""}`,
    },
  ];

  const purchase = async (event) => {
    try {
      event.preventDefault();

      const price = ethers.utils.parseUnits(total.toString(), "ether");

      setBusy(true);

      const account = window.ethereum.selectedAddress;

      try {
        const currencyAddress = currencyOptions.find((c) => c.name.toLowerCase() === item.currency.toLowerCase())?.address;
        const erc20Contract = getErc20Contract(provider, currencyAddress);
        const allowanceTx = await erc20Contract.allowance(account, marketSolidContract.address);
        const approved = FixedNumber.fromString(
          formatEther(allowanceTx),
        ).toUnsafeFloat();
        if (approved < price) {
          const bigNumber = process.env.REACT_APP_MAX_AMOUNT ?? "1157920892373161954235709850086";
          const approveAmount = ethers.utils.parseUnits(bigNumber, "ether");
          const erc20ContractTx = await erc20Contract.approve(marketSolidContract.address, approveAmount);
          await erc20ContractTx.wait();
        }
      } catch (e) {
        console.log(e);
      }


      const { savedItem, transaction } = await transferNft(item);
      setBusy(false);
      if (savedItem) {
        updateItem(savedItem);
        if (onSuccess) {
          onSuccess({
            status: "Success",
            id: transaction.hash,
          });
        }
      }
    } catch (e) {
      setError(e?.error?.message);
      setBusy(false);
    }
  };

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Checkout</div>
      <p className={styles.info}>
        You are about to purchase <strong>{item.name}</strong> from{" "}
        <strong>{item?.account?.name || item?.account?.address}</strong>
      </p>
      <div className={styles.table}>
        {items?.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      {error && (
        <div className={styles.attention}>
          <div className={styles.preview}>
            <Icon name='info-circle' size='32' />
          </div>
          <div className={styles.details}>
            <div className={styles.subtitle}>An Error Occurred</div>
            <div className={styles.text}>{error}</div>
          </div>
        </div>
      )}
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={purchase} disabled={busy}>
          {busy ? <Loader /> : "I understand, continue"}
        </button>
        <Convertor className={styles.button} />
        <button className={cn("button-stroke", styles.button)} onClick={onClose} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Checkout;
