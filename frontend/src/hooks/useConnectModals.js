import { useState } from "react";

export default function useConnectModals() {

  const [walletsModal, setWalletsModal] = useState(false);
  const [unsupportedChainsModal, setUnsupportedChainsModal] = useState(false);

  /***
   *
   * @param props : boolean?
   */
  const switchUnsupportedChainsModal = (props) => setUnsupportedChainsModal(prevState => typeof props !== "boolean" ? !prevState : props);
  /***
   *
   * @param props : boolean?
   */
  const switchWalletsModal = (props) => setWalletsModal(prevState => typeof props !== "boolean" ? !prevState : props);

  return {
    unsupportedChainsModal, walletsModal,
    switchUnsupportedChainsModal, switchWalletsModal,
  };
}
