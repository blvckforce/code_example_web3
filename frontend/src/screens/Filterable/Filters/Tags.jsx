import cn from "classnames";
import React from "react";
import Icon from "../../../components/Icon";
import { API_PARAMS } from '../../../config/API_ROUTES';
import useFiltersClick from '../../../hooks/useFiltersClick';
import styles from "../Filterable.module.sass";

const Tags = ({ tagOptions = [], selections, switchSelections, name = API_PARAMS.TAGS }) => {

  const onClick = useFiltersClick(switchSelections);

  return (
    <div className={styles.tags}>
      {
        Array.isArray(tagOptions) &&
        tagOptions.map((data, index) => (
            <button
              key={name + index}
              onClick={onClick(name, data.key, data.label ?? data.name)}
              className={cn("button-small", styles.filter_button, {
                "button-outline": !selections?.[name]?.[data.key],
              })}
            >
              <Icon name={data.icon} size='20' />
              <span>{data.label ?? data.name}</span>
            </button>
          ),
        )
      }
    </div>
  );
};

export default Tags;
