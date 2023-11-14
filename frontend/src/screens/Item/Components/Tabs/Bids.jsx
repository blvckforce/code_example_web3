import cn from 'classnames';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import LoaderCircle from '../../../../components/LoaderCircle';
import AcceptBidModal from '../../../../components/modals/AcceptBid';
import useModalVisibility from '../../../../hooks/useModalVisibility';
import classes from './styles.module.scss';
import React, { useEffect, useState } from 'react';
import useMakeOfferMethods, { OFFER_STATUS } from '../../../../hooks/useMakeOfferMethods';


const Bids = ({ isOwner, itemId }) => {

  const { offers, loading, acceptOffer, updateOffers, denyOffer } = useMakeOfferMethods(isOwner, itemId);
  const { visible: acceptVisible, switchVisible: switchAccessVisible } = useModalVisibility();

  const [selectedBidInfo, setSelectedBidInfo] = useState(null);

  useEffect(() => {
    updateOffers(itemId).catch();
  }, [itemId, updateOffers]);

  const onAccept = (offerId) => () => {
    const offer = offers.find(({ id }) => id === offerId);

    if (offer) {
      setSelectedBidInfo({
        id: offerId,
        itemName: offer.nft.name,
        bidderName: offer.account.name ?? offer.account.address,
        price: offer.amount,
        currency: offer.currency,
      });
      switchAccessVisible();
    } else {
      toast.error(`Can't accept this.`);
    }
  };

  const onModalClose = () => {
    setSelectedBidInfo(null);
    switchAccessVisible();
  };


  const cancelOffer = (offerID) => () => denyOffer(offerID);

  return (
    <>
      {
        loading && (
          <div className={classes.loaderContainer}>
            <LoaderCircle className={classes.loader} />
          </div>
        )
      }

      {
        !offers?.length && !loading && (
          <h4>Empty</h4>
        )
      }
      {
        offers.map(({ id, status, account, amount, currency, nonce }) => (
          <div key={id} className={cn(classes.row, classes.offer)}>
            <img src={account?.avatar || "/images/content/avatar.png"} alt='avatar'
                 className={classes.avatar} />

            <div className={classes.info}>
              <p>
                <span className={classes.accent}>{`${amount} ${currency}`}</span>
                {' by '}
                <span className={classes.accent}>{isOwner ? account?.name ?? account?.address : 'You'}
            </span>
              </p>
              <p>{moment(+nonce).format('d.mm.yyyy, hh:mm a')}</p>
            </div>
            {
              isOwner && (
                <button className={'button'}
                        disabled={status !== OFFER_STATUS.ACTIVE}
                        onClick={onAccept(id)}>
                  Accept
                </button>
              )
            }
            {
              !isOwner && (
                <button className='button button-pink' onClick={cancelOffer(id)}>
                  Cancel
                </button>
              )
            }
          </div>
        ))
      }


      {
        isOwner && (
          <AcceptBidModal visible={acceptVisible} onClose={onModalClose}
                          info={selectedBidInfo}
                          onAccept={acceptOffer} onDeny={denyOffer} />
        )
      }

    </>
  );
};

export default Bids;
