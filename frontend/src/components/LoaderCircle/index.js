import React from "react";
import cn from "classnames";
import styles from "./LoaderCircle.module.sass";

const LoaderCircle = ({ className }) => {
  return <div className={cn(styles.loader, className)} />;
};

export default LoaderCircle;
