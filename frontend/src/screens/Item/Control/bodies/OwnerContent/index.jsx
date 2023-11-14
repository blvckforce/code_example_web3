import classes from "../../../Item.module.sass";
import ContentHeader from '../ContentHeader';
import OwnerStats from './OwnerStats';

const OwnerContent = ({ children, bidsCount, serviceFee, agentFee, price, item, timeIsEnd, highestBid }) => {

  if (!item.on_sale) {
    return (
      <OwnerStats currency={item.currency} price={price} serviceFee={serviceFee} agentFee={agentFee} />
    );
  }

  if (timeIsEnd) return (
    <>{children}</>
  );

  return (
    <>
      <ContentHeader>
        <p className={classes.mutt}>Total Bids:</p>
        <p className={classes.bids}>{bidsCount?.count}</p>
      </ContentHeader>

      <OwnerStats currency={item.currency} price={price} serviceFee={serviceFee} agentFee={agentFee} />

    </>
  );
};


export default OwnerContent;
