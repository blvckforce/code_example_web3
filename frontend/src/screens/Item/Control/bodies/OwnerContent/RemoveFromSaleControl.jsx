import cn from 'classnames';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Loader from '../../../../../components/Loader';
import classes from '../../../Item.module.sass';

const RemoveFromSaleControl = (
  { removeFromSale, updateItem, item, btnClasses, btnText = "Remove From Sale", canCancel }) => {
  const [requesting, setRequesting] = useState(false);

  const onRemoveFromSale = async () => {
    try {
      if (canCancel) {
        setRequesting(true);
        const itemSaved = await removeFromSale(item.id);

        if (itemSaved.data) {
          updateItem(itemSaved.data);
        }
      }
    } catch (e) {
      toast.error(e?.error?.message);
      // console.trace(e);
    }
  };

  if (!canCancel) return null;

  return (
    <>
      <button
        className={cn("button-stroke", classes.btn, btnClasses)}
        onClick={onRemoveFromSale}
        disabled={requesting}
      >{
        requesting
          ? <Loader />
          : btnText
      }
      </button>
    </>
  );
};


export default RemoveFromSaleControl;
