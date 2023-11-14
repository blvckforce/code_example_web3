import { chain, find, isEmpty, isNil, toNumber, trimStart } from 'lodash-es';
import { useContractsContext } from "../contexts/contracts.context";
import { useEffect, useState } from "react";
import { parseEventData } from "../utils/helpers";

export function useAuctionUpdating(auctionId = null) {
    const { marketSolidContract: contract } = useContractsContext();
    const [state, setState] = useState(null);

    useEffect(() => {
        let intervalId = null;

        if (!isNil(contract)) {
            let lastBlockNumber = 0;

            intervalId = setInterval(async () => {
                const filter = contract.filters.eBid();
                filter.fromBlock = lastBlockNumber;
                filter.toBlock = "latest";

                try {
                    const auctionLogs = await contract.provider.getLogs(filter);

                    const logsLastBlockNumber = chain(auctionLogs).last().get("blockNumber").value();
                    lastBlockNumber = logsLastBlockNumber ? logsLastBlockNumber + 1 : lastBlockNumber;

                    const auctionData = chain(auctionLogs)
                        .map(
                            (x) => ({
                                id: toNumber(x?.topics?.[1]),
                                blockNumber: x?.blockNumber,
                                bidder: `0x${trimStart(parseEventData(x.data, 0), "0")}`,
                                highestBid: Number("0x" + parseEventData(x.data, 1)) / 1000000000000000000,
                            }),
                        )
                        .reverse()
                        .uniqBy((({ tokenId }) => tokenId))
                        .value();

                    if (isEmpty(auctionData)) {
                        return;
                    }

                    if (auctionId) {
                        const auction = find(auctionData, ({ id }) => auctionId === id);
                        if (!isEmpty(auction)) {
                            return setState(auction);
                        }
                        return;
                    }

                    setState(auctionData);
                } catch (e) {
                    console.log(e);
                }
            }, 5000);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [contract, auctionId]);

    return state;
}
