import React from 'react';
import Price from '../../../../../components/Price';
import classes from '../../../Item.module.sass';

const OwnerStats = ({ currency, agentFee, price, serviceFee }) => {

  const priceWithServiceFee = +(serviceFee / 100 * (price ?? 0)).toFixed(12);
  const priceWithAgentFee = agentFee ? +(agentFee / 100 * (price ?? 0)).toFixed(12) : undefined;

  return (
    <div className={classes.row}>
      {
        !!serviceFee &&
        <p>Service fee <span className={classes.accent}>{serviceFee}%</span>
          <span>{`${priceWithServiceFee} ${currency}`}</span>
          <Price price={priceWithServiceFee} currency={currency}
                 convertTo='USD' convertToSymbol='$' showSymbol={true}
                 showCurrency={false} />
        </p>
      }
      {
        priceWithAgentFee !== undefined &&
        <p>Agent fee <span className={classes.accent}>{agentFee}%</span>
          <span>{`${priceWithAgentFee} ${currency}`}</span>
          <Price price={priceWithAgentFee} currency={currency}
                 convertTo='USD' convertToSymbol='$' showSymbol={true}
                 showCurrency={false} />
        </p>
      }
    </div>
  );
};

export default OwnerStats;
