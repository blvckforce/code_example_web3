import cn from 'classnames';
import React from 'react';
import Dropdown from '../../../../components/Dropdown2';
import Price from '../../../../components/Price';
import { useAuctionMethods } from '../../../../hooks/useAuctionMethods';
import styles from '../Control.module.sass';
import PutOnSaleControl from './OwnerContent/PutOnSaleControl';
import RemoveFromSaleControl from './OwnerContent/RemoveFromSaleControl';

const FixedPriceControls = ({
                              servicePercent, serviceFee, item, isOwner, paymentMethod, paymentOptions,
                              setPaymentMethod, setVisibleModalPurchase, updateItem,
                            }) => {

  const { putOnSale, removeFromSale } = useAuctionMethods();

  return (
    <>
      {
        !!serviceFee &&
        <p className={styles.text}>
          Service fee <span className={styles.percent}>{servicePercent}%</span>{" "}<span>
          <Price price={serviceFee} currency={item.currency} showSymbol={false} showCurrency={true} />
          </span>
          <span>
            <Price price={serviceFee} currency={item.currency}
                   convertTo='USD' convertToSymbol='$' showSymbol={true}
                   showCurrency={false} />
          </span>
        </p>
      }
      <div className={styles.foot}>
        {
          !isOwner ? (
              <>
                <div className={styles.btns}>
                  <Dropdown
                    value={paymentMethod}
                    options={paymentOptions}
                    value_index='id'
                    label_index='label'
                    setValue={setPaymentMethod}
                  />
                  <button
                    className={cn("button", styles.button)}
                    onClick={() => setVisibleModalPurchase(true)}
                  >
                    Purchase now
                  </button>
                </div>

                {
                  // item.price && (
                  // <button
                  //   className={cn("button-stroke", styles.button, styles.placeBidButton)}
                  //   onClick={changeVisibleModalBid}
                  // >
                  //   Place a bid
                  // </button>
                  // )
                }
                {/*<button*/}
                {/*  className={cn("button", styles.button)}*/}
                {/*  onClick={changeVisibleModalSale}*/}
                {/*>*/}
                {/*  Put on sale*/}
                {/*</button>*/}
              </>
            )
            :
            (
              item.on_sale ?
                <RemoveFromSaleControl
                  item={item}
                  canCancel
                  removeFromSale={removeFromSale}
                  updateItem={updateItem}
                />
                :
                <PutOnSaleControl putOnSale={putOnSale} item={item} updateItem={updateItem} />
            )}
      </div>
      {/*<div className={styles.note}>You can sell this token on Crypter Marketplace</div>*/}
    </>
  );
};

export default FixedPriceControls;
