import cn from "classnames";
import React from "react";
import Accordion from "../../../components/Accordion";
import Image from "../../../components/Image";
import useFiltersClick from '../../../hooks/useFiltersClick';
import styles from "../Filterable.module.sass";

const PaymentsMethod = ({ paymentOptions, selections, switchSelections, name, ...rest }) => {

  const onClick = useFiltersClick(switchSelections);

  if (!Array.isArray(paymentOptions) || !paymentOptions.length) return null;

  return (
    <Accordion
      className={cn(styles.accordion, styles.dropdown, styles.price)}
      title='Payment Type'
      {...rest}
    >
      {paymentOptions.map((data, index) => (
        <button
          key={name + data.id}
          onClick={onClick(name, data.id, data.label ?? data.name)}
          className={cn("row button-full", styles.collection, {
            "button-outline":  selections?.[name]?.[data.id],
            [styles.button_outline]:  selections?.[name]?.[data.id],
          })}
        >
          <Image src={data.icon} />
          <span className={styles.label}>{data.label ?? data.name}</span>
        </button>
      ))}
    </Accordion>
  );
};

export default PaymentsMethod;
