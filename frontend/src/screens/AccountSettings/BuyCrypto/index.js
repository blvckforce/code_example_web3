import React from "react";
import cn from "classnames";

import styles from "./BuyCrypto.module.sass";

const BuyCrypto = ({ title }) => {
  return (
    <div className={styles.container}>
      <h1 className={cn("h2", styles.title)}>{title}</h1>
      <iframe
          id="onramper-widget"
          title="Onramper widget"
          frameBorder="no"
          allow="accelerometer; autoplay; camera; gyroscope; payment;"
          src="https://widget.onramper.com?color=266678&apiKey=pk_test_QIM5JNiLYhmFo3a9FUWTR7Rg45fJQtWxKJAo0BYo6380"
          className={styles.onramper}
      />
    </div>
  );
};

export default BuyCrypto;
