import useMakeOfferMethods from "../../../../hooks/useMakeOfferMethods";
import { useAuctionMethods } from "../../../../hooks/useAuctionMethods";
import React, { useState } from "react";
import LoaderCircle from "../../../../components/LoaderCircle";
import styles from "../Notification.module.sass";
import cn from "classnames";

const OfferNotificationDescription = ({ notification, index, markAsRead, markAsArchived, formatDescription }) => {
  const { denyOffer } = useMakeOfferMethods(false, 0);
  const { acceptOfferNft } = useAuctionMethods();

  const [isLoaded, setIsLoaded] = useState(true);

  const onAcceptOffer = async (notification) => {
    setIsLoaded(false);
    await acceptOfferNft(notification.extra_data.id);
    await markAsArchived(notification.id)();
    setIsLoaded(true);
  }
  const onDeclineOffer = async (notification) => {
    setIsLoaded(false);
    await denyOffer(notification.extra_data.id);
    await markAsArchived(notification.id)();
    setIsLoaded(true);
  }

  const renderTemplate = (textPart) => {
    if (textPart.match(/::acceptOffer/))
      return (!isLoaded ? <LoaderCircle className={styles.small} key={"acceptOfferLoader" + index}/> :
        <button onClick={() => onAcceptOffer(notification)} className={cn('button-small')}
                key={"acceptOffer" + index}>Accept</button>);

    if (textPart.match(/::declineOffer/))
      return (!isLoaded ? <LoaderCircle className={styles.small} key={"declineOfferLoader" + index}/> :
        <button onClick={() => onDeclineOffer(notification)} className={cn('button-small', 'button-pink')}
                key={"declineOffer" + index}>Decline</button>);
    return ' ' + textPart;
  }

  return (
    <div className={styles.description}>{formatDescription(notification, renderTemplate)}</div>
  );
}

export default OfferNotificationDescription;
