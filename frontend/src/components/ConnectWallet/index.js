import React, { useEffect, useState } from "react";
import { useProfile } from "../../contexts/profile.context";
import styles from "./ConnectWallet.module.sass";
import { connectorByMedia } from "../../utils/connectors";
import { useGlobalState } from "../../contexts/Global";
import { useWallet } from "../../hooks/useWallet";
import LoaderCircle from "../LoaderCircle";
import Icon from "../Icon";

const menu = Object.keys(connectorByMedia);

const ConnectWallet = ({ onConnected }) => {
  const { connectWallet, activatingConnector, web3 } = useGlobalState();
  const { profile } = useProfile();
  const { wallet } = useWallet();
  const [selected, setSelected] = useState();

  const connect = (walletName) => {

    setSelected(walletName);
    connectWallet(walletName);
  };

  const isSelected = (x) => {
    return (wallet === x || selected === x) && web3.active && !activatingConnector && profile?.isAuthorized;
  };

  useEffect(() => {

    if (profile?.isAuthorized && web3.active && onConnected)
      onConnected();

  }, [onConnected, profile?.isAuthorized, web3.active]);

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <p>Please select chosen type of wallet</p>
      </div>
      <div className={styles.body}>
        <div className={styles.menu}>
          {menu.map((x, index) => (
            <button
              className={styles.link}
              key={index}
              onClick={() => connect(x)}
              disabled={isSelected(x)}
            >
              <img src={connectorByMedia[x].image} alt={connectorByMedia[x].title} />
              <span>{connectorByMedia[x].title}</span>

              {
                selected === x && activatingConnector &&
                <LoaderCircle className={styles.loading} />
              }
              {
                isSelected(x) &&
                <Icon name='check' className={styles.active} size={10} />
              }

            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
