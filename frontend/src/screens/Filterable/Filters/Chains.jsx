import cn from "classnames";
import Accordion from "../../../components/Accordion";
import Image from "../../../components/Image";
import useFiltersClick from '../../../hooks/useFiltersClick';
import { backendUrl } from "../../../utils/helpers";
import styles from "../Filterable.module.sass";

const Chains = ({ chainsOptions, name, selections, switchSelections, ...rest }) => {

  const onClick = useFiltersClick(switchSelections);

  return (
    <Accordion
      className={cn(styles.accordion, styles.dropdown, styles.price)}
      title='Chains'
      {...rest}
    >
      {chainsOptions.map((data) => (
        <button
          key={name + data.id}
          onClick={onClick(name, data.id, data.label ?? data.name)}
          className={cn("row button-full", styles.collection, {
            "button-outline": selections?.[name]?.[data.id],
            [styles.button_outline]: selections?.[name]?.[data.id],
          })}
        >
          <Image src={backendUrl(data?.icon?.url) || data.icon} />
          <span className={styles.label}>{data.label ?? data.name}</span>
        </button>
      ))}
    </Accordion>
  );
};

export default Chains;
