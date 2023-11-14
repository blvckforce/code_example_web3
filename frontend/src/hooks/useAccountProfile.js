import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useState } from "react";
import { injected } from "../utils/connectors";
import { authUserProfile, getSignature, getUserProfile } from "../utils/wallet";
import axiosInstance, { getToken } from "../utils/http";
import { useGlobalState } from "../contexts/Global";
import toast from "react-hot-toast";

const accountStruct = {
  accountExist: false,
  isAuthorized: false,
  account: {},
};

export function useAccountProfile() {
  const { account, active, library: provider, deactivate, activate } = useWeb3React();
  const { account: accountGlobal, web3: web3Global } = useGlobalState();

  const accountHelpers = {
    liked(nft_id) {

      if (!nft_id) return false;

      let like = this.account?.likes?.find((x) => x.nft === nft_id);
      return !!like;
    },

    isApprovedArtist(account) {
      return (account ? account : this.account)?.artist?.status === "approved";
    },
  };

  let defaultProfileState = {
    ...accountStruct,
    ...accountHelpers,
  };

  const [profile, setProfile] = useState(defaultProfileState);

  useEffect(() => {
    injected.isAuthorized()
      .then((isAuthorized) => {
        if (isAuthorized) {
          activate(injected, undefined, true)
            .catch();
        }
      });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))


  const fetchProfile = useCallback( async (silent = false) => {
    if (active && account && provider) {
      let user = await getUserProfile(account);
      if (!silent && user && !user.isAuthorized) {

        const signer = provider.getSigner();
        user = await authUserProfile(signer, account);

        if (!user || !user.isAuthorized)
          deactivate();
      }

      if (user && user.account) {
        setProfile(
          (state) => ({ ...state, ...user }),
        );
      }
    }
  }, [account, active, deactivate, provider]);

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active && account && provider) {
      axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          const response = error.response;

          if (response?.status !== 401) {
            return Promise.reject(error);
          }

          if (response?.status === 401 && !originalRequest._retry) {
            try {
              const signer = provider.getSigner();
              const user = await authUserProfile(signer, account, true);

              if (user && user.account) {
                setProfile(
                  (state) => ({ ...state, ...user }),
                );
              }

              originalRequest._retry = true;

              if (originalRequest?.headers['x-signature']) {
                const provider = web3Global.library;
                if (!provider) {
                  toast("Connect wallet to perform this action");
                  return;
                }
                const signer = provider.getSigner();
                const signature = await getSignature(true, signer, accountGlobal);
                if (!signature) return;
                originalRequest.headers['x-signature'] = signature;
              }

              return axiosInstance(originalRequest);
            } catch (e) {
              setProfile(null);
              window.location.replace("/");
              return Promise.reject();
            }
          }

          return Promise.reject(error);
        },
      );
    }
    if (getToken()) { /* FIXME: temporarily fix */
      fetchProfile(true).catch(console.error);
    }
  }, [active, account, provider, fetchProfile, accountGlobal, web3Global]);

  return [profile, setProfile, fetchProfile];
}
