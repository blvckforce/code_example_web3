import qs from 'qs'
import { debounce } from 'lodash';
import cn from "classnames";
import React, { useEffect, useState } from "react";
import Accordion from "../../../components/Accordion";
import Image from "../../../components/Image";
import SearchInput from "../../../components/SearchInput";
import useFiltersClick from '../../../hooks/useFiltersClick';
import styles from "../Filterable.module.sass";
import { backendUrl } from "../../../utils/helpers";
import http from "../../../utils/http";

const Collection = ({ switchSelections, selections, name, ...rest }) => {
  const [collections, setCollections] = useState();

  const handler = async (event) => {
    event?.preventDefault?.()

    const value = event?.target?.value;

    const queryObject = {
      disableDefault: true,
    }

    if (value) {
      queryObject.name_contains = value;
    }

    const query = qs.stringify(queryObject)

    const { data } = await http.get(`collections?${query}`)
    setCollections(data);
  };

  useEffect(() => {
    handler().catch();
  }, []);

  const searchHandler = debounce(handler, 200)

  const onClick = useFiltersClick(switchSelections)

  return (
      <Accordion
          className={cn(styles.accordion, styles.dropdown, styles.price)}
          title='Collections'
          {...rest}
      >
        <SearchInput className={styles.searchField} placeholder='Filter' onChange={searchHandler} autoComplete='off'/>

        {collections?.map((data) => (
            <button
                key={name + data.id}
                onClick={onClick(name, data.id, data.label ?? data.name)}
                className={cn("row button-full", styles.collection, {
                  "button-outline": selections?.[name]?.[data.id],
                  [styles.button_outline]: selections?.[name]?.[data.id],
                })}
            >
              <Image src={backendUrl(data?.avatar) || data.icon} />
              <div className={styles.label}>{data.label ?? data.name}</div>
              {data.verified &&
              <span>
              <Image src='/images/content/verified_account_primary.png' />
            </span>
              }
            </button>
        ))}
      </Accordion>
  );
};

export default Collection;
