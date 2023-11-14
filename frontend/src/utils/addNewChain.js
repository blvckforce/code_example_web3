export const toHexString = (num) => `0x${num.toString(16)}`;

export const addNewChain = async (chain) => {
  let params = [];
  let method = "wallet_addEthereumChain";

    params = [
      {
        chainId: toHexString(chain),
      },
    ];
    method = "wallet_switchEthereumChain";

  await window.ethereum
    .request({ method, params })
    .catch((error) => console.log("Error", error.message));
};
