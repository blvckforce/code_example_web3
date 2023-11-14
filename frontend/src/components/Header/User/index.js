import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import NAVIGATE_ROUTES from '../../../config/routes';
import { useProfile } from "../../../contexts/profile.context";
import styles from "./User.module.sass";
import Icon from "../../Icon";

const items = [
  {
    title: "My profile",
    icon: "profile",
    url: NAVIGATE_ROUTES.PROFILE,
  },
  {
    title: "Account Settings",
    icon: "setting",
    url: NAVIGATE_ROUTES.ACCOUNT_SETTINGS,
  },
  {
    title: "Log Out",
    icon: "logout",
    action: "logout",
  },
];

const User = ({ className }) => {

  const [visible, setVisible] = useState(false);
  const { profile, logout } = useProfile();

  const menuItemClicked = (item) => {
    if (item.url && item.url.startsWith("/"))
      setVisible(!visible);

    if (item.action === "logout") {
      logout();
    }
  };

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.user, className)}>
        <div className={styles.head} onClick={() => setVisible(!visible)}>
          <div className={styles.avatar}>
            <img src={profile?.account.avatar || "/images/content/avatar.png"} alt='Avatar' />
          </div>
        </div>
        {visible && (
          <div className={styles.body}>

            <div className={styles.menu}>
              {items?.map((x, index) =>
                x.url ? (
                  x.url.startsWith("http") ? (
                    <a
                      className={styles.item}
                      href={x.url}
                      rel='noopener noreferrer'
                      key={index}
                      onClick={() => menuItemClicked(x)}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size='24' />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </a>
                  ) : (
                    <Link
                      className={styles.item}
                      to={x.url}
                      onClick={() => menuItemClicked(x)}
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size='24' />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </Link>
                  )
                ) : (
                  <button className={styles.item} key={index} onClick={() => menuItemClicked(x)}>
                    <div className={styles.icon}>
                      <Icon name={x.icon} size='24' />
                    </div>
                    <div className={styles.text}>{x.title}</div>


                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default User;
