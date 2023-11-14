import cn from "classnames";
import React from "react";
import Accordion from "../../../components/Accordion";
import useFiltersClick from '../../../hooks/useFiltersClick';
import styles from "../Filterable.module.sass";

const Category = ({ categoryOptions, selections, switchSelections, name, ...rest }) => {

  const onClick = useFiltersClick(switchSelections);

  return (
    <Accordion
      className={cn(styles.accordion, styles.dropdown, styles.price)}
      title='Categories'
      {...rest}
    >
      {categoryOptions.map((data, index) => (
        <button
          key={name + data.id + index}
          onClick={onClick(name, data.id, data.label ?? data.name)}
          className={cn("row button-full", styles.collection, {
            "button-outline":  selections?.[name]?.[data.id],
            [styles.button_outline]:  selections?.[name]?.[data.id],
          })}
        >
          {
            typeof data.icon === "string"
              ? <img src={data.icon} alt={name} />
              : <span className={styles.border}>{data.icon}</span>
          }
          <span className={styles.label}>{data.label ?? data.name}</span>
        </button>
      ))}
    </Accordion>
  );
};

export default Category;
