import { Web3Provider } from "@ethersproject/providers";
import toast from "react-hot-toast";

import API, { AccountServices, AgentServices } from "../services/API";
import { backendUrl } from "./helpers";
import { clearToken, setToken } from './http';

export const getUserAgent = async (userId) => {
  const teamData = await AgentServices.getUserAgent(userId);
  return teamData?.data?.[0]?.agent?.account;
};

export const getSignature = async (sign, signer, account) => {
  if (sign) {

    if (!signer) {

      toast.error("Signer not found: Signing is required");
      return;
    }

    const nonce = await AccountServices.getNonce(account);

    if (nonce.error)
      return null;

    let signature;
    try {
      signature = await signer.signMessage(nonce.data.nonce);

    } catch (error) {
      toast.error(error.message);
      return;
    }
    return signature;
  }
};

export const getLibrary = (provider) => {

  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

const parseProfile = (profile) => {
  if (profile?.account?.artist) {

    if (profile.account.artist.sample_files)
      profile.account.artist.sample_files.forEach((sample, index) => {
        profile.account.artist.sample_files[index].url = backendUrl(profile.account.artist.sample_files[index].url);
      });
  }
  return profile;
};

export const parseAccount = (account) => {

  let profile = parseProfile({ account: account });
  return profile.account;
};

export const getUserProfile = async (account) => {
  const data = {
    address: account,
    name: "",
  };
  const resp = await AccountServices.connect(data);

  if (resp.error) { //not successful return
    return null;
  }

  const { accessToken, account: acc, ...rest } = resp.data;
  if (acc?.address !== account) {
    clearToken();
    return null;
  } else {
    setToken(accessToken);
  }
  return parseProfile({ accessToken, account: acc, ...rest });
};

export const authUserProfile = async (signer, account) => {

  const nonce = await AccountServices.getNonce(account);
  let signature = "";

  if (nonce.error)
    return null;

  try {

    signature = await signer.signMessage(nonce.data.nonce);
  } catch (error) {
    window.location.replace("/");
    toast.error(error.message);
    return null;
  }

  const resp = await AccountServices.auth({ address: account, signature: signature });

  if (resp.error)
    return null;

  setToken(resp.data.accessToken);
  return parseProfile(resp.data);

};

export const updateUserProfile = async (account, data, sign = false, signer, content = "") => {

  const fileUpload = content === "file";

  const signature = await getSignature(sign, signer, account);

  if (fileUpload) {
    data.append("signature", signature);
  } else {
    data.signature = signature;
  }

  let resp = null;

  const config = {
    headers: {
      'x-signature': signature
    }
  };

  if (data.agency) {
    resp = await AccountServices.createAgentAccount(account, data, config);
  } else {
    resp = await (fileUpload ? AccountServices.uploadFile(account, data, config) : AccountServices.update(account, data, config));
  }

  if (!resp || resp.error) //not successful return
    return;

  return parseProfile(resp.data);

};

export const updateUserArtistProfile = async (account, data, sign = false, signer) => {

  const signature = await getSignature(sign, signer, account);
  if (!signature) return;

  data.append("signature", signature);

  const config = {
    headers: {
      'x-signature': signature
    }
  };

  const resp = await AccountServices.update(`${account}/artist`, data, config);

  if (!resp || resp.error) //not successful return
    return;

  return parseProfile(resp.data);

};

export const getUserByID = async (id) => {

  const resp = await AccountServices.get(id);

  if (resp.error || !resp.data) { //not successful return

    return null;
  }

  return parseAccount(resp.data);
};

export const teamSignedRequest = async (account, action, teamID, data = {}, sign = false, signer) => {

  const actions = ["leave", "drop", "update-fee", "change-fee"];
  const endpoints = {
    "leave": `agent/leave/${teamID}`,
    "drop": `artist/drop/${teamID}`,
    "update-fee": `fee/update/${teamID}`,
    "change-fee": `fee/change/${teamID}`,
    "message": "message",
    "messageAgent": "message/agent",
  };

  if (!endpoints[action])
    return toast.error("Invalid action");

  const signature = await getSignature(sign, signer, account);
  if (!signature) return;

  data.signature = signature;

  const config = {
    headers: {
      'x-signature': signature
    }
  };

  return AgentServices.post(endpoints[action], data, config);
};

export const dropAgentFromTeam = async (teamID) => {
  return AgentServices.delete(teamID);
};

export const dropArtistFromTeam = async (teamID) => {
  return AgentServices.delete(teamID);
};

/***
 *
 * @param {{ email: string,
 *           fee: number,
 *           invitationId: 0 }} data
 * @return {Promise<{data: *, status: *}|{error: *, message: *}|undefined>}
 */
export const acceptAgentFee = async (data) => {
  return AgentServices.invite(data);
};


export const createCollection = async (account, data, sign = false, signer) => {

  const signature = await getSignature(sign, signer, account);
  if (!signature) return;

  const config = {
    headers: {
      'x-signature': signature
    }
  };

  const resp = await API.addCollection(data, config);

  if (!resp || resp.error) //not successful return
    return;

  return parseAccount(resp.data);
};

export const updateCollection = async (id, account, data, sign = false, signer) => {

  const signature = await getSignature(sign, signer, account);
  if (!signature) return;


  const config = {
    headers: {
      'x-signature': signature
    }
  };

  const resp = await API.updateCollection(id, data, config);

  if (!resp || resp.error) //not successful return
    return;

  return parseAccount(resp.data);
};

