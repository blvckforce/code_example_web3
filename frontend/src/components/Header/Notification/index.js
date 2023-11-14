import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import { PAGINATION } from '../../../config/API_ROUTES';
import NAVIGATE_ROUTES from "../../../config/routes";
import { useProfile } from "../../../contexts/profile.context";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import { AccountServices } from "../../../services/API";
import Loader from "../../Loader";
import Notice from "../../Notice";
import { Images } from "../../../screens/Filterable/Notification";
import { parseAccount } from "../../../utils/wallet";
import { printDate } from "../../../utils/helpers";


const Notification = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);
  const { profile } = useProfile();

  const fetchNotifications = async () => {
    if (!profile.isAuthorized)
      return;
    setBusy(true);

    const resp = await AccountServices.unreadNotificationsList(`?${PAGINATION.LIMIT}=5`);

    setBusy(false);

    if (!resp.error && resp.data)
      setItems(resp.data);
  };

  const markAsRead = (id) => async () => {
    setBusy(true);

    await AccountServices.markAsRead(id).catch()
    const resp = await AccountServices.unreadNotificationsList(`?${PAGINATION.LIMIT}=5`);

    setBusy(false);

    if (!resp.error && resp.data)
      setItems(resp.data);
  }

  useEffect(() => {
    fetchNotifications().catch();
    // eslint-disable-next-line
  }, [profile]);

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.notification, className)}>
        <button
          className={cn(styles.head)}
          onClick={() => setVisible(!visible)}
        >
          <Icon
            className={styles.pic}
            name='fire'
            size='24'
          />
        </button>
        {visible && (
          <div className={styles.body}>
            <div className={cn("h4", styles.title)}>
              <Link
                className={cn("button-small", styles.button)}
                to={NAVIGATE_ROUTES.NOTIFICATION}
                onClick={() => setVisible(!visible)}
              >
                See all
              </Link>
            </div>
            <div className={styles.list}>
              {busy && <Loader className={styles.loader} />}
              {(!items?.length && !busy) && <Notice message={"Empty"} />}

              {items?.map((x, index) => {
                  x.user = parseAccount(x.user);
                  return (
                    <Link
                      className={styles.item}
                      to={NAVIGATE_ROUTES.NOTIFICATION}
                      onClick={() => setVisible(!visible)}
                      key={index}
                    >
                      <div className={styles.preview}>
                        <img src={Images[x.tag] || x.user?.avatar || Images.others} alt='Notification'/>
                      </div>
                      <div className={styles.details}>
                        <div className={styles.subtitle}>{x.title}</div>
                        <div className={styles.price}>{x.price}</div>
                        <div  className={styles.bottomWrapper}>
                          <span className={styles.date}>
                          {printDate(x.created_at)}
                          </span>
                          {
                            x.read === false
                                ? (
                                    <button className={styles.readButton} onClick={markAsRead(x.id)}>
                                      read
                                    </button>
                                )
                                : null
                          }
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>

          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default Notification;
