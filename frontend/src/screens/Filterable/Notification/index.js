import React, { useState, useEffect } from "react";
import cn from "classnames";
import SEO from '../../../components/SEO';
import NAVIGATE_ROUTES from "../../../config/routes";
import styles from "./Notification.module.sass";
import LoaderCircle from "../../../components/LoaderCircle";
import Notice from "../../../components/Notice";
import { AccountServices } from "../../../services/API";
import { parseAccount } from "../../../utils/wallet";
import { Link } from "react-router-dom";
import { printDate } from "../../../utils/helpers";
import { PAGINATION } from "../../../config/API_ROUTES";
import DefaultNotificationDescription from "./components/DefaultNotificationDescription";
import OfferNotificationDescription from "./components/OfferNotificationDescription";

const images = {
  "listing": "/images/content/activity-pic-6.jpg",
  "purchase": "/images/content/activity-pic-4.jpg",
  "message": "/images/content/activity-pic-1.jpg",
  "invite": "/images/content/activity-pic-3.jpg",
  "onboarding": "/images/content/activity-pic-5.jpg",
  "offer": "/images/content/activity-pic-7.jpg",
  "others": "/images/content/activity-pic-2.jpg",
};

const notificationTags = {
  listing: 'listing',
  purchase: 'purchase',
  message: 'message',
  invite: 'invite',
  onboarding: 'onboarding',
  offer: 'offer',
  others: 'others',
}

const Notification = ({ className, notTitle, filters, onResultUpdated }) => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [items, setItems] = useState([]);

  const icons = [
    "transfer",
  ];

  //@TODO improve for memorized selectors
  const matchFilters = (item) => {
    if (!filters)
      return true;

    let keys = Object.values(filters).map(x => {
      return x.value;
    });
    if (!keys || !keys.length)
      return true;
    return keys.includes(item.tag);
  };

  const fetchNotifications = async () => {

    setIsLoaded(false);

    const resp = await AccountServices.notifications();

    setIsLoaded(true);

    if (!resp)
      return setError("Error loading notifications");

    if (resp.error || !resp.data)
      return setError(resp.message || resp.error);

    setItems(resp.data);

    onResultUpdated(resp.data.length);
  };

  const matchItems = () => {
    return items?.filter(item => matchFilters(item));
  };

  const markAsRead = (id) => async () => {
    setIsLoaded(false);

    await AccountServices.markAsRead(id).catch()
    const resp = await AccountServices.unreadNotificationsList(`?${PAGINATION.LIMIT}=5`);

    setIsLoaded(true);

    if (!resp.error && resp.data)
      setItems(resp.data);
  }

  const markAsArchived = (id) => async () => {
    setIsLoaded(false);

    await AccountServices.archiveAllRelated(id).catch()
    const resp = await AccountServices.unreadNotificationsList(`?${PAGINATION.LIMIT}=5`);

    setIsLoaded(true);

    if (!resp.error && resp.data)
      setItems(resp.data);
  }

  useEffect(() => {

    onResultUpdated(matchItems().length);
  }, [filters]);

  useEffect(() => {

    fetchNotifications().catch();
  }, []);

  if (error) return <WithSEO> <Notice message={error.message} type='error'/></WithSEO>;
  if (!isLoaded) return <WithSEO><LoaderCircle className={styles.loader}/></WithSEO>;

  if (!items?.length) return <WithSEO><Notice message={"Emtpy"}/></WithSEO>;

  return (
    <WithSEO>
      <div className={cn(styles.top, { [styles.no_title]: !notTitle })}>
        <h3 className={cn("h3", styles.title)}>My Notifications</h3>
      </div>
      <div className={styles.row}>
        <div className={styles.wrapper}>
          <div className={styles.list}>
            {matchItems().map((notification, index) => {
                notification.user = parseAccount(notification.user);
                notification.you = parseAccount(notification.you);
                return (
                  <div className={styles.item} key={index} data-tag={notification.tag || "notice"}>
                    <div className={styles.preview}>
                      <img src={images[notification.tag] || notification.user?.avatar || images.others}
                           alt='Notification'/>
                      <div
                        className={styles.icon}
                      >

                      </div>
                    </div>
                    <div className={styles.details}>
                      <div className={styles.subtitle}>{notification.title}</div>
                      <NotificationDescription key={index} notification={notification} index={index}
                                               markAsRead={markAsRead} markAsArchived={markAsArchived}/>
                      <div className={styles.bottomWrapper}>
                          <span className={styles.date}>
                          {printDate(notification.created_at)}
                          </span>
                        {
                          notification.read === false
                            ? (
                              <button className={styles.readButton} onClick={markAsRead(notification.id)}>
                                read
                              </button>
                            )
                            : null
                        }
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </WithSEO>
  );
};

const WithSEO = ({ children }) => (
  <>
    <SEO title={'Notifications'} url={window.location.href}/>
    {children}
  </>
);

const User = ({ user }) => {
  //let user = users[id] || {}; //get user from remote if neccessary
  if (!user) {
    return null
  }

  return (
    <Link to={`${NAVIGATE_ROUTES.PROFILE}/${user.id}`}>
      <img src={user?.avatar || "/images/content/avatar.png"} alt=''/>
      <span className='ellipsis'>{user?.name || user?.address}</span>
    </Link>
  );
};

const formatDescription = (item, customMapper = (p) => ' ' + p) => {
  let description = item.description;
  let parts = description.split(" ");

  return parts.map((part, index) => {
    if (part.match(/::you/))
      return (<User user={item.you} key={"me" + index}/>);

    if (part.match(/::user/))
      return <User user={item.user} key={"user" + index}/>;

    if (part.match(/::amount/))
      return <span className='amount' key={"amount" + index}>{" " + item.amount} </span>;

    return customMapper(part);
  });
};

const NotificationDescription = ({ notification, index, markAsRead, markAsArchived }) => {
  switch (notification.tag) {
    case notificationTags.offer:
      return (<OfferNotificationDescription notification={notification} index={index} markAsRead={markAsRead}
                                            markAsArchived={markAsArchived} formatDescription={formatDescription}/>);
    default:
      return (<DefaultNotificationDescription notification={notification} formatDescription={formatDescription}/>);
  }
}

export const Images = images;
export default Notification;
