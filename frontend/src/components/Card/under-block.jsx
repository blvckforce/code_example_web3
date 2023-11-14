import moment from 'moment';
import React from 'react';
import TimeLeft from '../TimeLeft';
import styles from './Card.module.sass';

const UnderBlock = ({ bidMode, item }) => {
  // const bitPrice = round(getPrice() + toNumber(item.minPriceStep), 6);

  if (!bidMode || !item.is_minted || !item.on_sale) {
    return null;
  }

  if ((+(item.start_date ?? item.startTime ?? 0) + (item.end_date ?? 0) * 1000) <= Date.now()) {
    return (
      <UnderBlockWrapper>
        <span className={styles.right}>The Auction Has Ended</span>
      </UnderBlockWrapper>
    );
  }

  if (item.startDateMessage || item.timeLeft) {
    return (
      <UnderBlockWrapper>
        <TimeLeft
          time={item.startDateMessage || item.timeLeft}
          tag={item.startDateMessage ? "" : "left"}
          className={styles.time}
          showIcon
        />
      </UnderBlockWrapper>

    );
  }

  if (item.start_date && item.end_date) {
    return (
      <UnderBlockWrapper>
        <TimeLeft
          time={moment(+item.start_date + item.end_date * 1000).format("lll")}
          preTag={"Ends at"}
          className={styles.time}
          showIcon
        />
      </UnderBlockWrapper>
    );
  }

  return null;
};

const UnderBlockWrapper = ({ children }) => (
  <div className={styles.foot}>
    <div className={styles.counter}>
      {/*{item.stats?.length ? `${item.stats[0]?.value}/${item.stats[0]?.total}` : ''}*/}
    </div>
    {children}
  </div>
);

export default UnderBlock;
