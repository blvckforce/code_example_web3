import cn from "classnames";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SOCKET_EVENT_NAMES from "../../../../config/socket-event-names";
import { useGlobalState } from "../../../../contexts/Global";
import { useSocketContext } from "../../../../contexts/socket.context";
import { useAuctionMethods } from "../../../../hooks/useAuctionMethods";
import { checkAuctionChanges } from "../../../../utils/requests";
import classes from "../../Item.module.sass";
import ContentHeader from "./ContentHeader";
import Countdown from "./Countdown";
import OwnerContent from "./OwnerContent";
import OwnerControls from './OwnerContent/OwnerControls';
import UserContent, { UserBids } from "./UserContent";


const SilentAuction = ({ owner = false, item, serviceFee, agentFee, updateItem }) => {

  const { setHandler } = useSocketContext();
  const { account } = useGlobalState();

  const {
    cancelBid, transferNft, makeBid,
    removeFromSale, getMyBids, getHighestBid,
    getBidsCount, putOnSale,
  } = useAuctionMethods();

  const [isTimeEnd, setIsTimeEnd] = useState(false);
  const [lastUserBid, setLastUserBid] = useState(null);
  const [userBids, setUserBids] = useState([]);
  const [highestBid, setHighestBid] = useState(null);

  const [shouldUpdate, setShouldUpdate] = useState(0);

  const [bidsStats, setBidsStats] = useState({
    count: 0,
    lastBidTime: null,
  });
  const duration = (+item.end_date ?? 0) * 1000;
  const startTime = +item.start_date;
  const minBid = item.minBid ?? item.bid;

  const onTimeEnd = () => {
    setIsTimeEnd(true);
  };

  useEffect(() => {
    if ((+(item.start_date ?? item.startTime ?? 0) + +(item.end_date ?? 0) * 1000) <= Date.now()) {
      onTimeEnd();
    }
  }, [item.end_date, item.startTime, item.start_date]);

  const auctionStarted = +(item.startTime ?? item.start_date) <= Date.now();

  useEffect(() => {
    if (item.id && (owner || isTimeEnd)) getHighestBid(item.id)
      .then(({ data }) => !!data && setHighestBid(data))
      .catch(console.trace);
  }, [isTimeEnd, item.id, owner]);


  // get last user bids
  useEffect(() => {
    if (item?.id && !owner) getMyBids().then(
      ({ data }) => {
        const itemBids = (data ?? []).filter(({ auction_id }) => +auction_id === +item.id);
        const sorted = itemBids.sort(({ amount: a }, { amount: b }) => a - b);
        setUserBids(sorted);
      })
      .catch(console.trace);
  }, [item?.id, owner]);


  useEffect(() => {
    if (!owner) setLastUserBid(userBids[userBids.length - 1]);
  }, [userBids, owner]);

  // get bids count for both
  useEffect(() => {
    if (item?.id && shouldUpdate !== undefined) {
      getBidsCount(item.id)
        .then(({ data }) => {
          if (typeof data === "object") setBidsStats({ count: data.count, lastBidTime: data.lastAddedAt });
        })
        .catch(console.trace);
    }
  }, [item?.id, shouldUpdate]);

  const onMakeBid = useCallback(async (auctionItem, amount) => {
    try {
      const data = await makeBid(auctionItem, amount);

      /* optimistic update */
      if (typeof data.error === "undefined") {
        const { data: bidItem } = data;
        setUserBids(prevState => [...(prevState), bidItem]
          .sort(({ amount: a }, { amount: b }) => a - b));
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.trace(e.message);
      toast.error(e.message);
    }
  }, [makeBid]);


  const onCancelBid = useCallback(() => {
    if ((window.confirm !== undefined ? window.confirm("Do you really want to cancel all yours bets? ") : true)) {
      if (userBids.length) {
        Promise.allSettled(
          userBids.map(({ id }) => cancelBid(id)),
        )
          .catch(console.trace)
          .then(() => {
            setUserBids([]);
            setShouldUpdate(Math.random());
          });
      }
    }

  }, [userBids]);

  useEffect(() => {
    setHandler(SOCKET_EVENT_NAMES.BID_PLACED, (res) => {
      if (checkAuctionChanges(res, item.id)) {
        setShouldUpdate(Math.random());
      }
    });
  }, [setHandler, item.id]);

  if (!auctionStarted && !owner) return <h2 style={{ marginBottom: 0 }}>Starts
    at: {moment(+item.start_date).format("lll")}</h2>;


  return (
    <>
      <div className={classes.inner}>
        {
          owner ? (
            <OwnerContent
              agentFee={agentFee}
              bidsCount={bidsStats}
              price={highestBid?.amount}
              highestBid={highestBid}
              serviceFee={serviceFee}
              timeIsEnd={isTimeEnd}
              item={item}
              updateItem={updateItem}
            >
              {
                highestBid &&
                <WinHeader currency={highestBid.currency}
                           highestBidPrice={highestBid.amount}
                           user={highestBid.account}
                />
              }
            </OwnerContent>
          ) : (
            <UserContent
              item={item}
              bidsStats={bidsStats}
              minBid={minBid}
              timeIsEnd={isTimeEnd}
              bidded={!!userBids.length}
              makeBid={onMakeBid}
              cancelBid={onCancelBid}
              lastUserBid={lastUserBid}
            >
              {
                highestBid &&
                <WinHeader currency={highestBid.currency}
                           highestBidPrice={highestBid.amount}
                           user={highestBid.account}
                           address={highestBid.bidder_address}
                />
              }
              {
                highestBid?.bidder_address === account && (
                  <div className={cn(classes.head, classes.trophy)}>
                    <div className={classes.imgWrapper}>
                      <img src='/images/icon-trophy.svg' alt='trophy' />
                    </div>
                    <p>Congratulations! You won the auction.</p>
                  </div>
                )
              }
            </UserContent>
          )
        }

        {/* next same for both roles */}
        {item.on_sale && auctionStarted &&
          <>
            <Divider />
            <div className={classes.row}>
              <p>{!isTimeEnd ? "Silent auction closes in" : "Auction has ended"}</p>

              <div className={classes.spaceContainer}>
                <Countdown
                  startDate={startTime}
                  duration={duration}
                  onTimeEnd={onTimeEnd} />
              </div>
            </div>
          </>
        }
      </div>

      {/* remove from sale button only for owner */}
      {
        owner && (
          <OwnerControls timeIsEnd={isTimeEnd}
                         item={item}
                         serviceFee={serviceFee}
                         agentFee={agentFee}
                         currency={highestBid?.currency ?? item.currency}
                         highestBidPrice={highestBid?.amount ?? 0}
                         removeFromSale={removeFromSale}
                         transferNft={transferNft}
                         putOnSale={putOnSale}
                         updateItem={updateItem}
                         canCancel={!bidsStats.count}
          />
        )
      }
    </>
  );
};

const Divider = () => <div className={classes.divider} />;

const WinHeader = ({ user, highestBidPrice, currency, address = "" }) => (
  <ContentHeader avatar={user.image}>
    <div>
      <p>Highest bid by &nbsp;<span className={classes.subAccent}>{address === user.address ? "You" : user.name}</span>
      </p>
      <UserBids price={highestBidPrice} currency={currency} />
    </div>
  </ContentHeader>
);


export default SilentAuction;
