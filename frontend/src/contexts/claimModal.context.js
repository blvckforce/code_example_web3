import { createContext, useContext, useState } from "react";
import ClaimModal from '../components/modals/ClaimModal';

const ClaimModalContext = createContext({
  setRoundsToClaim: () => undefined,
  setTitle: () => undefined,
});

export const useClaimModal = () => useContext(ClaimModalContext);

export const ClaimModalProvider = ({ children }) => {

  const [roundsToClaim, setRoundsToClaim] = useState([]);
  const [title, setTitle] = useState("");

  const value = { setRoundsToClaim, setTitle };

  // clear data
  const onClose = () => {
    setRoundsToClaim([]);
    setTitle("");
  };

  return (
    <ClaimModalContext.Provider value={value}>
      {children}
      <ClaimModal visible={!!roundsToClaim.length}
                  title={title}
                  onClose={onClose}
                  roundsToClaim={roundsToClaim}
      />

    </ClaimModalContext.Provider>
  );
};
