import { toNumber } from 'lodash-es';
import React, { useState } from "react";
import cn from "classnames";
import { ethers } from "ethers";
import { useContract } from "../../hooks/useContract";

import Icon from "../Icon";
import Loader from "../Loader";
import styles from "./Bid.module.sass";

const servicePercent = Number(process.env.REACT_APP_SERVICE_FEE_PERCENT) || 0;

const Bid = ({ className, item, onSuccess, onClose }) => {

  const { erc20Contract } = useContract();

  const [bid, setBid] = useState(item.minBid ?? item.price);  /* FIXME: need to test  */
  const [fee, setFee] = useState(+(bid * servicePercent / 100).toFixed(12));
  const [totalBid, setTotalBid] = useState(fee + bid);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const items = [
    {
      title: "Service fee",
      value: fee,
    },
    {
      title: "Total bid amount",
      value: totalBid,
    },
  ];

  const changeBidHandler = (event) => {
    let bid = "";
    let fee = 0;
    let totalBid = 0;
    setError("");

    if (event.target.value !== "") {
      bid = +event.target.value;
      fee = +(bid * servicePercent / 100).toFixed(12);

      totalBid = parseFloat((bid + fee).toString());
    }

    setBid(bid);
    setFee(fee);
    setTotalBid(totalBid);
  };

  const placeBidHandler = async () => {
    setBusy(true);
    try {
      const minBid = toNumber(item.minBid);
      const bidPrice = toNumber(bid);

      if (!bidPrice) {
        setError("Enter bid");
        return;
      }

      if (bidPrice < minBid) {
        setError(`Minimum bid is: ${minBid} ${item.currency.toUpperCase()}`);
        return;
      }

      const convertedTotalBid = ethers.utils.parseUnits(bidPrice.toString(), "ether");

      const params = [
        item.id,
      ];

      if (item.currency === "ether") {
        params.push(0);
        params.push({ value: convertedTotalBid });
      } else {
        const erc20ContractTx = await erc20Contract.approve(process.env.REACT_APP_NFT_AUCTION_ADDRESS, convertedTotalBid);
        await erc20ContractTx.wait();

        params.push(convertedTotalBid);
      }

      // const auctionContractTx = await auctionContract.bid(...params);
      // const transaction = await auctionContractTx.wait();

      onSuccess({
        status: "Success",
        // id: transaction?.transactionHash,
      });
    } catch (e) {
      setError(e?.error?.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Place a bid</div>
      <div className={styles.startTime}>
        <div className={styles.row}>
          <input
            type='number'
            className={styles.bidInput}
            placeholder='Enter bid'
            onChange={changeBidHandler}
            value={bid}
            autoFocus
          />
          {/*<div className={styles.col}>Enter bid</div>*/}
          <div className={styles.col}>
                        <span className={styles.currency}>
                            {bid} {item.currency}
                        </span>
          </div>
        </div>
        {items?.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>
                            <span className={styles.currency}>
                                {x.value} {item.currency}
                            </span>
            </div>
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
        <button className={cn("button", styles.button)} onClick={placeBidHandler}>
          {busy ? <Loader /> : "Place a bid"}
        </button>
        <button className={cn("button-stroke", styles.button)} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Bid;
