import { toNumber } from 'lodash-es';
import { useEffect, useState } from "react";
import UnsupportedChainModal from "../../components/UnsupportedChainModal";

const currentProjectNetworkId = toNumber(process.env.REACT_APP_NETWORK_ID) || 1;

const networksList = {
  1: {
    id: 1,
    name: "Main net",
  },
  3: {
    id: 3,
    name: "Ropsten",
  },
};


const Watcher = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const run = async () => {
    const chainId = await window?.ethereum?.request({ method: "eth_chainId" });

    if (toNumber(chainId) !== currentProjectNetworkId) {
      setIsModalOpen(true);
    }

    const handleChainChanged = (chainId) => {
      const currentNetwork = toNumber(chainId);

      if (currentNetwork !== currentProjectNetworkId) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    };

    const handleAccountsChanged = () => {
      window.location.replace("/");
    };

    window?.ethereum?.on?.("chainChanged", handleChainChanged);
    window?.ethereum?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      window?.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window?.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  };

  const closeModal = () => setIsModalOpen(false)

  useEffect(() => {
    run();
  }, []);

  return (
    <UnsupportedChainModal
      networksList={networksList}
      visible={isModalOpen}
      currentId={currentProjectNetworkId}
      closeModal={closeModal}
    />
  );
};

export default Watcher;
