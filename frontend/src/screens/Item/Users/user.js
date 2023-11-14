import React from "react";
import cn from "classnames";
import styles from "./Users.module.sass";

const User = ({ item, className } = {}) => {

  if (!item) return null;


  // const title =



  return (
    <div className={cn(styles.item, className)}>
      <div className={styles.avatar}>
        {
          item.avatar
            ? <img src={item.avatar} alt='Avatar' />
            : <div className={styles.circle} />
        }
        {item.reward && (
          <div className={styles.reward}>
            <img src={item.reward} alt='Reward' />
          </div>
        )}
      </div>
      <div className={styles.details}>
        <div className={styles.position}>{item.position}</div>
        <p className={styles.name}>{item.name}</p>
      </div>
    </div>
  );
};

export default User;
