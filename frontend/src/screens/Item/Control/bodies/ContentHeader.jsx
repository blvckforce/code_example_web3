import React from "react";
import classes from "../../Item.module.sass";

const ContentHeader = ({ children, avatar }) => {
  return (
    <div className={classes.head}>
      <div className={classes.imgWrapper}>
        <img src={avatar ?? "/images/icon-bid.svg"} alt={avatar ? "avatar" : "bid"} />
      </div>
      {
        children
      }
    </div>
  );
};

export default ContentHeader;
