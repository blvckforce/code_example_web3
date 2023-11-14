import cn from "classnames";
import Accordion from "../../../components/Accordion";
import useFiltersClick from '../../../hooks/useFiltersClick';
import styles from "../Filterable.module.sass";

const Status = ({ statusOptions = [], name, switchSelections, selections, ...rest }) => {

  const onClick = useFiltersClick(switchSelections);

  return (
    <Accordion className={styles.accordion} title='Status'
               {...rest}
    >
      <div className={styles.status}>
        {statusOptions.map((data, index) => (
          <button
            key={name + index}
            onClick={onClick(name, data.key, data.label ?? data.name)}
            className={cn("button-small", styles.filter_button, {
              "button-outline": !selections?.[name]?.[data.key],
            })}
          >
            {data.label ?? data.name}
          </button>
        ))}
      </div>
    </Accordion>
  );
};

export default Status;
