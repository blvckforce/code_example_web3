import { create as ipfsHttpClient } from "ipfs-http-client";
import config from "../../config";
import { checkFileBeforeUpload } from "../../utils/upload";

export const client = new ipfsHttpClient({ url: process.env.REACT_APP_IPF_CLIENT_URL || 'https://ipfs.infura.io:5001/api/v0' });

export const checkFileBeforeCreateNFTUpload = (mimeType = '', fileSize = 0, extension = '') => {
  const { types, maximumSize } = config.upload;
  return checkFileBeforeUpload(mimeType, fileSize, extension, types, maximumSize);
};

export const getFileExtension = (name = "") => {
  if (typeof name !== 'string') return '';
  return name.split(".").slice(-1)?.toString() ?? '';
};
