import React from "react";
import useConnectModals from "../../hooks/useConnectModals";
import ConnectWallet from "../ConnectWallet";
import Modal from "../Modal";

const WalletConnectModal = () => {

  const {walletsModal, switchWalletsModal} = useConnectModals()

  return (
    <>
      <Modal
        title={'Connect Wallet'}
        visible={walletsModal}
        onClose={switchWalletsModal()}
      >
        <ConnectWallet onConnected={switchWalletsModal} />
      </Modal>
    </>
  );
};

export default WalletConnectModal;
