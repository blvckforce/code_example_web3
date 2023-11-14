import React from "react";
import cn from "classnames";

import User from "./user";
import styles from "./Users.module.sass";

const Users = ({ className, items }) => {
  return (
    <div className={cn(styles.users, className)}>
        <div className={styles.list}>
            {items.map((item, index) => (
                <User item={item} key={index} />
            ))}
        </div>
    </div>
  );
};

export default Users;
