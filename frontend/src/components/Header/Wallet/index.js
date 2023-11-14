import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import { useBalance } from "../../../hooks/useBalance";
import CheckAndClaim from "../../CheckClaim";
import styles from "./Wallet.module.sass";
import Icon from "../../Icon";
import { useGlobalState } from "../../../contexts/Global";
import { formatEther } from "@ethersproject/units";
import { FixedNumber } from "@ethersproject/bignumber";
import { printWallatAddress } from "../../../utils/helpers";

export const Balance = ({ className, currency }) => {

  const { balance } = useBalance(currency);

  return (
    <div className={cn(styles.price, className)}>
      {
        balance === null ? "-" : balance ?
          `${FixedNumber.fromString(
            formatEther(balance),
          ).round(4)
          } ${currency?.toUpperCase() ?? "ETH"}`
          : ""
      }
    </div>
  );
};

const Wallet = ({ className }) => {
  const [visible, setVisible] = useState(false);


  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.wallet, className)}>
        <div className={styles.head} onClick={() => setVisible(!visible)}>
          <div className={styles.avatar}>
            <Icon
              className={styles.svg}
              name='wallet'
              size='24'
              index='sprite'
            />
          </div>
        </div>
        {visible && (
          <div className={styles.body}>
            <div className={styles.wrap}>
              <div className={styles.line}>
                <div className={styles.details}>
                  <Address />
                  <Balance />
                </div>
              </div>
              <button
                className={cn("button", styles.button)}
                disabled={true}
              >
                Add Funds
              </button>
            </div>
            {/*<div className={styles.menu}>
                            {items?.map((x, index) =>
                                <div
                                    className={styles.item}
                                    key={index}
                                >
                                    <div className={styles.icon}>
                                        <Icon name={x.icon} size="24" />
                                    </div>
                                    <div className={styles.text}>
                                        <div>{x.name}</div>
                                        <div className={styles.mute}>{x.description}</div>
                                    </div>
                                    <div className={styles.text}>
                                        <div>{x.swapp}</div>
                                        <div className={cn("text-right", styles.mute)}>{x.swapp_usd}</div>
                                    </div>
                                    <div className={styles.icon}>
                                        <Icon name="more" size="24" />
                                    </div>

                                </div>

                            )}
                        </div>*/}
            <CheckAndClaim />
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

const Address = () => {
  const { account } = useGlobalState();

  return (
    <div className={styles.info}>
      {printWallatAddress(account)}
    </div>
  );
};

export default Wallet;
