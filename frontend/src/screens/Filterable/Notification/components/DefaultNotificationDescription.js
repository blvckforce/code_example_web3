import styles from "../Notification.module.sass";
import React from "react";

const DefaultNotificationDescription = ({ notification, formatDescription }) => {
  return (
    <div className={styles.description}>{formatDescription(notification)}</div>
  );
}

export default DefaultNotificationDescription;
