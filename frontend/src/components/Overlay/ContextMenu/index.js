import cn from "classnames";
import React from "react";
import styles from "./ContextMenu.module.sass";

const ContextMenu = ({ children, visibleMenu = true, className }) => {
  return (
    <div
      className={cn(styles.box, { [styles.active]: visibleMenu }, className)}
    >
      {children}
    </div>
  );
};

export default ContextMenu;
