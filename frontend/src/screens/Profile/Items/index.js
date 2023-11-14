import React, { useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import NAVIGATE_ROUTES from "../../../config/routes";
import styles from "./Items.module.sass";
import Card from "../../../components/Card";

const Items = ({ className, items, editable, stub, activeNavTab }) => {
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [currentItem, setCurrentItem] = useState();
  const toggleMenu = (evt, itemIndex) => {
    evt.preventDefault();
    setCurrentItem(itemIndex);
    return setVisibleMenu(!visibleMenu);
  };

  return (
    <div className={cn(styles.items, className)}>
      <div className={styles.list}>
        {items?.map((item, index) => {
            item = stub ? item[stub] : item;
            if (!item)
              return null;
            return (
              <div className={styles.card} key={item.id || item.token_id}>
                <Card
                  item={item}
                  visibleMenu={visibleMenu && currentItem === index}
                  toggleMenu={(evt) => toggleMenu(evt, index)}
                  activeNavTab={activeNavTab}
                />
                {editable && (
                  <Link
                    className={cn("button-stroke button-full", styles.edit)}
                    to={`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${item.mode}/${item.id}`}
                  >
                    <span>Edit</span>
                  </Link>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default Items;
