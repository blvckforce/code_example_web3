import React, { useState } from "react";
import cn from "classnames";
import styles from "./Connect.module.sass";
import Icon from "../Icon";
import Modal from "../Modal";
import ConnectWallet from "../ConnectWallet";

const defaultMessage = `You need to connect your wallet first to sign messages and send
transaction to Ethereum network`;

const Connect = ({ className, message, onCancel }) => {

    const [visibleModalConnectWallet, setVisibleModalConnectWallet] = useState(false);
    const closeWallet = () => { setVisibleModalConnectWallet(false) }

    return (
        <>
            <div className={cn(className, styles.connect)}>
                <div className={styles.icon}>
                    <Icon name="wallet" size="24" />
                </div>
                <div className={styles.info}>
                    {message || defaultMessage}
                </div>
                <div className={styles.btns}>

                    <button type="button" onClick={() => setVisibleModalConnectWallet(true)} className={cn("button", styles.button)}>Connect wallet</button>

                    {onCancel && <button onClick={onCancel} className={cn("button-stroke", styles.button)}>Cancel</button>}
                </div>
            </div>
            <Modal
                title={'Connect Wallet'}
                visible={visibleModalConnectWallet}
                outerClassName={styles.wallet_modal}
                containerClassName={styles.wallet_modal_container}
                onClose={closeWallet}
            >
                <ConnectWallet onConnected={closeWallet} />
            </Modal>
        </>
    );
};

export default Connect;
