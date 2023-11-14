import React from "react";
import cn from "classnames";
import styles from "./Agent.module.sass";
import AgentProfileItem from "./Item";
import Notice from "../../../components/Notice";

const AgentItems = ({ className, items }) => {
  if (!items)
    return <Notice message='Empty' />;

  return (
    <div className={cn("row", styles.group, className)}>
      {items?.map((data, itemIndex) => (
        <AgentProfileItem key={`artist${itemIndex}`} team={data} />
      ))}
    </div>
  );
};

export default AgentItems;
