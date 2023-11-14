/**
 * Interface for interacting with blockchain
 * Result from blockchain can be detailed from backend.
 */

import { ethers } from "ethers";

class BlockchainInterface {

    provider
    nftContract
    marketContract
    auctionContract
    collectionContract

    constructor(provider, nftContract) {

        this.provider = provider;
        this.nftContract = nftContract;
    }

    /**
     *
     * @param {address} account - to address
     * @returns [] of owned tokenid by account
     */
    async fetchOwnedNFTByTokenId(account) {

        if (!account)
            return [];

        if (!this.nftContract)
            return [];

        let filter = this.nftContract.filters.Transfer(null, account)

        filter.fromBlock = 0;
        filter.toBlock = "latest";

        let logs = await this.provider.getLogs(filter);

        if (!logs)
            return [];

        console.log("nft transfers:", logs);

        let owned = [];

        logs.forEach((event) => {

            let addr = ethers.utils.hexStripZeros(event.topics[2]).toUpperCase();
            let tokenId = Number(event.topics[3]);

            if (addr == account.toUpperCase()) {

                owned.push(tokenId);
            }
        });

        return owned;
    }

    /**
     *
     * @param {int} tokenId
     * @returns array of owners wallet address
     */
    async fetchNFTOwnersByTokendId(tokenId) {
        if (!tokenId)
            return [];

        if (!this.nftContract)
            return [];

        let filter = this.nftContract.filters.Transfer(null, null, tokenId)

        filter.fromBlock = 0;
        filter.toBlock = "latest";

        let logs = await this.provider.getLogs(filter);

        if (!logs)
            return [];

        let owners = [];

        logs.forEach((event) => {

            let addr = ethers.utils.hexStripZeros(event.topics[2]);
            owners.push(addr);
        });

        return owners;
    }

}

export default BlockchainInterface
