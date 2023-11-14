import cn from "classnames";
import React, { useCallback, useState } from "react";
import Icon from "../../../components/Icon";
import styles from "../Filterable.module.sass";

const FilterPanel = ({ className, setVisible, filters }) => {

  const [accordion, setAccordion] = useState({});

  const showFilter = useCallback((key) => {
    setAccordion(prevState => ({ ...{ [key]: !prevState[key] } }));
  }, []);

  return (
    <div className={cn(styles.filters, className)}>
      <div className={cn(styles.head, className)}>
                    <span className={styles.title}>
                        <Icon name='filter-dark' size='24' />
                        Filter
                    </span>
        <button
          className={styles.toggle}
          onClick={() => setVisible(prev => !prev)}
        >
          <Icon name='arrow-left' size='24' />
        </button>
      </div>
      <div className={styles.body}>
        {filters.map((filter, index) => {
          if (React.isValidElement(filter)) {
            return React.cloneElement(filter,
              {
                  ...filter.props,
                  ...(
                      filter.props.name
                          ? {
                              visible: !!accordion[filter.props.name],
                              setVisible: () => showFilter(filter.props.name)
                          }
                          : { accordion, showFilter }
                  ),
                  key: index,
              },
            );
          }

          return <div key={index}>{filter}</div>;
        })}
      </div>
    </div>
  );
};

export default FilterPanel;
