import React from 'react';
import PutOnSaleControl from './PutOnSaleControl';
import SaleControl from './SaleControl';

const OwnerControls = (
  {
    timeIsEnd, highestBidPrice, agentFee, serviceFee,
    currency, transferNft, removeFromSale,
    item, updateItem, putOnSale, canCancel,
  }) => {

  return (
    item.on_sale ?
      <>
        <SaleControl
          canCancel={canCancel}
          removeFromSale={canCancel ? removeFromSale : () => null}
          item={item}
          updateItem={updateItem}
          timeIsEnd={timeIsEnd}
          transferNft={transferNft}
          agentFee={agentFee}
          serviceFee={serviceFee}
          highestBidPrice={highestBidPrice}
          currency={currency}
        />

      </>
      :
      <PutOnSaleControl putOnSale={putOnSale} item={item} updateItem={updateItem} />
  );
};

export default OwnerControls;
