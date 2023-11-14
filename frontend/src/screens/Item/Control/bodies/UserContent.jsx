import cn from "classnames";
import { useState } from "react";
import Price from "../../../../components/Price";
import TextInput from "../../../../components/TextInput";
import { useProfile } from "../../../../contexts/profile.context";
import { fromNowShorthand } from "../../../../utils/helpers";
import classes from "../../Item.module.sass";
import ContentHeader from "./ContentHeader";

const UserContent = (
  {
    children, bidsStats = {}, minBid, timeIsEnd,
    makeBid, bidded = false, lastUserBid, item, cancelBid
  },
) => {

  const { profile: { account } = {} } = useProfile();

  const { avatar } = account ?? {};

  const [amount, setAmount] = useState(minBid);
  const [requesting, setRequesting] = useState(false);

  const [error, setError] = useState("");

  const bidChange = (ev) => {
    setAmount(ev.target.value);
    setError(prevState => !!prevState ? "" : prevState);
  };

  const onMakeBid = async () => {
    try {
      setRequesting(true);

      await makeBid(item, amount);

    } catch (e) {
      console.trace(e);
      setError(e?.error?.message);
    } finally {
      setRequesting(false);
    }
  };

  const onCancelBid = async () => {
    try {
      setRequesting(true);
      const data = await cancelBid(item.id);

      console.log(data);
    } catch (e) {

    } finally {
      setRequesting(false);
    }
  };

  if (timeIsEnd) return (
    <>{children}</>
  );

  return (
    <>
      <ContentHeader>
        <div>
          <p>
            {
              !!bidsStats.lastBidTime
                ? <>Latest bid placed <span className={classes.subAccent}>{fromNowShorthand(bidsStats.lastBidTime)}</span></>
                : <span/>
            }
          </p>
          <p className={classes.bids}>{`${bidsStats.count} bids`}</p>
        </div>
      </ContentHeader>

      <div className={classes.bodyRow}>
        <p>Minimum bid <span className={classes.subAccent}>{`${minBid} ${item.currency?.toUpperCase()}`}</span></p>
      </div>

      {
        bidded && lastUserBid && (
          <>
            <ContentHeader avatar={avatar}>
              <div>
                <p>Your bid</p>
                <UserBids currency={item.currency} price={lastUserBid.amount} />
              </div>
            </ContentHeader>

            <div className={classes.bodyRow}>
              <button className={cn("button-stroke", classes.btn)}
                      disabled={requesting} onClick={onCancelBid}
              >
                Cancel bid
              </button>
            </div>
          </>
        )
      }

      <div className={cn(classes.bodyRow, classes.order)}>
        <TextInput
          type={"number"}
          value={amount}
          onChange={bidChange}
          min={minBid}
          step={0.1}
          placeholder={item.currency?.toUpperCase()}
          className={classes.orderPrice}
          readOnly={requesting}
        />

        <button className={cn("button", classes.orderButton)}
                disabled={requesting}
                onClick={onMakeBid}
        >Place a bid
        </button>
      </div>
      {
        error && <p className={classes.error}>{error}</p>
      }
    </>

  );
};

export const UserBids = ({ currency, price }) => (
  <p className={classes.userBids}>
    <span>{`${price} ${currency.toUpperCase()}`}</span>
    <span className={classes.inner}>
      <Price price={price} currency={currency}
             convertTo='USD' convertToSymbol='$' showSymbol={true}
             showCurrency={false} />
    </span>
  </p>
);

export default UserContent;
