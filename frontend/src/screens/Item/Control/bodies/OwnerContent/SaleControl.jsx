import cn from 'classnames';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGlobalState } from '../../../../../contexts/Global';
import classes from '../../../Item.module.sass';
import OwnerStats from './OwnerStats';
import RemoveFromSaleControl from './RemoveFromSaleControl';

const SaleControl = ({
                       timeIsEnd, highestBidPrice, agentFee, serviceFee,
                       currency, transferNft, removeFromSale,
                       item, updateItem, canCancel,
                     }) => {
  const [requesting, setRequesting] = useState(false);
  const { account } = useGlobalState();

  const onTransferNft = async () => {
    try {
      setRequesting(true);

      await transferNft(item, account);

    } catch (e) {
      console.trace(e);
      toast.error(e?.error?.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    !timeIsEnd ? (
      <div className={classes.spaceContainer}>
        <RemoveFromSaleControl
          item={item}
          canCancel={canCancel}
          removeFromSale={removeFromSale}
          updateItem={updateItem}
        />
      </div>
    ) : (
      <>
        <div className={classes.inner}>
          <div className={classes.spaceContainer}>
            <OwnerStats agentFee={agentFee} serviceFee={serviceFee}
                        price={highestBidPrice} currency={currency} />

          </div>
          <div className={cn(classes.spaceContainer, classes.ownerControls)}>
            {
              !canCancel &&
              <button className={cn("button", classes.button)}
                      onClick={onTransferNft}
                      disabled={requesting}
              >
                Transfer NFT
              </button>
            }
            <RemoveFromSaleControl
              item={item}
              removeFromSale={removeFromSale}
              updateItem={updateItem}
              btnClasses={classes.button}
              btnText={"Cancel Sale"}
              canCancel={canCancel}
            />
          </div>
        </div>
      </>
    )
  );
};

export default SaleControl;
