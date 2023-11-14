import { createContext, useContext, useEffect } from "react";
import { useAccountProfile } from "../hooks/useAccountProfile";
import useWallet from "../hooks/useWallet";
import { logoutUserProfile } from "../utils/helpers";
import { clearToken } from '../utils/http';
import { useGlobalState } from "./Global";

const ProfileContext = createContext({
  profile: undefined,
  setProfile: () => null,
  logout: () => null,
});
export const useProfile = () => useContext(ProfileContext);


export const ProfileProvider = ({ children }) => {

  const {
    web3: { deactivate, active, connector }, activatingConnector, setActivatingConnector, connectorName,
  } = useGlobalState();

  const [profile, setProfile, fetchProfile] = useAccountProfile();
  const { setWallet } = useWallet();

  const logout = () => {
    deactivate();
    clearToken();
    if (profile.isAuthorized) {
      logoutUserProfile().catch();
    }

    setProfile(prev => ({
      ...prev,
      ...{ isAuthorized: false, account: { avatar: { url: "" } } },
    }));

  };

  // handle logic to recognize the connector currently being activated
  useEffect(() => {
    if (activatingConnector) {
      //fetch account details from backend and request signature
      if (profile?.isAuthorized !== true)
        fetchProfile().catch();

      //if auth reset activating and set wallet
      if (profile?.isAuthorized === true) {

        setActivatingConnector(undefined);

        if (active) setWallet(connectorName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector, profile?.isAuthorized]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
};
