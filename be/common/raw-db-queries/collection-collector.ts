import { cleanStr } from '../utils/functions';

export const GetAllLastEventsByAddress = (address:string, blockStartsFrom = 0) => cleanStr(
  `
          SELECT tt.*
          FROM collection_collector_events as tt
                   INNER JOIN (
              SELECT data -> 'returnValues' -> 'tokenId' as InTokenId,
                     MAX("blockNumber")                    AS "maxBlockNumber"
              FROM collection_collector_events
              WHERE lower(address) = lower('${address}')
              GROUP BY InTokenId
          ) groupedtt
                              ON data -> 'returnValues' -> 'tokenId' = groupedtt.InTokenId
                                  AND "blockNumber" = groupedtt."maxBlockNumber"
          WHERE ("blockNumber" >= ${blockStartsFrom} OR "hasError" = true)
            AND lower(address) = lower('${address}');
  `,
);


export const GetAllLastEventsByAddressWithoutNft = (address: string) => cleanStr(
  `
      SELECT "parsedData"
      FROM collection_collector_events
               INNER JOIN (
          SELECT data -> 'returnValues' -> 'tokenId' as InTokenId,
                 MAX("blockNumber")                  AS "maxBlockNumber"
          FROM collection_collector_events
          WHERE lower(address) = lower('${address}')
          GROUP BY InTokenId
      ) groupedtt
                          ON data -> 'returnValues' -> 'tokenId' = groupedtt.InTokenId
                              AND "blockNumber" = groupedtt."maxBlockNumber"
      WHERE ("parsedData" -> 'eventData' ->> 'tokenId'):: INTEGER not in (
          SELECT token_id
          FROM "Nfts"
          WHERE lower("contractAddress") = lower('${address}')
      )
        AND lower(address) = lower('${address}')
        AND ("parsedData" ->> 'hasBeenDeleted'):: BOOLEAN != true
        AND "hasError" = false;
  `,
);
