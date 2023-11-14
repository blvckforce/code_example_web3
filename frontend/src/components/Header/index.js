import React, { useEffect, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";
import cn from "classnames";
import config from '../../config';
import NAVIGATE_ROUTES, { UPLOAD_MODES } from '../../config/routes';
import { useProfile } from "../../contexts/profile.context";
import { useSettings } from "../../hooks/useSettings";
import styles from "./Header.module.sass";
import Icon from "../Icon";
import Image from "../Image";
import Notification from "./Notification";
import User from "./User";
import Wallet from "./Wallet";
import ConnectWallet from "../ConnectWallet";
import Modal from "../Modal";

import DropdownMenu from "../DropdownMenu";
import Search from "./Search";


const { multiple } = config.upload;

const Headers = () => {

  const [visibleNav, setVisibleNav] = useState(false);
  const [visibleSubNav, setVisibleSubNav] = useState({});
  const [visibleModalConnectWallet, setVisibleModalConnectWallet] = useState(false);

  const settings = useSettings();
  const { profile } = useProfile();

  const headerRef = useRef(null);

  const toggleSubNav = (index, defaultState = null) => {
    setVisibleSubNav({ [index]: (defaultState == null) ? !visibleSubNav[index] : defaultState });
  };

  const urlActive = (url) => {
    return window.location.pathname.indexOf(url) > -1;
  };

  const nav = [{
    url: NAVIGATE_ROUTES.HOME, title: "Home",
  }, {
    url: NAVIGATE_ROUTES.EXPLORE, title: "Explore", subs: settings.categories,
  }, // {
    //   url: NAVIGATE_ROUTES.MARKET,
    //   title: "Marketplace",
    //   subs: settings.categories,
    // },
    // {
    //   url: NAVIGATE_ROUTES.FOLLOWING, title: "Following",
    // },
    // {
    //      url: "/agents",
    //      title: "Agents",
    //  }
  ];

  const switchVisibleNav = () => setVisibleNav(prevState => !prevState);

  const createItem = () => {
    // history.push(NAVIGATE_ROUTES.UPLOAD_VARIANTS);

    setVisibleNav(false);
  };

  useEffect(() => {
    if (headerRef.current) {
      const height = getComputedStyle(headerRef.current)?.height;
      if (typeof window !== undefined) {
        document.documentElement.style.setProperty('--header-height', height);
      }
    }
  }, []);


  return (
    <>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.container}>
          <Link className={styles.logo} to='/'>
            <Image
              className={styles.pic}
              src='/images/logo-dark.svg'
              srcDark='/images/logo-light.svg'
              alt=''
            />
          </Link>
          <div className={cn(styles.wrapper, { [styles.active]: visibleNav })}>
            <nav className={styles.nav}>

              <Search />

              {nav.map((x, index) => (

                x.subs ? <DropdownMenu
                    headClassName={styles.dHead}
                    toggle={<button
                      className={cn(styles.link, { [styles.active]: urlActive(x.url) })}
                      onClick={() => toggleSubNav(index)}
                    >
                      {x.title}
                      <Icon name='arrow-down' size='16' className={styles.icon} />

                    </button>}
                    show={visibleSubNav[index]}
                    hide={() => toggleSubNav(index, false)}
                    className={styles.dropdownmenu}
                    bodyClassName={styles.dropdown_body}
                    key={index}
                  >
                    {x.subs.map((sub, subIndex) => (<NavLink
                      className={styles.link}
                      activeClassName={styles.subactive}
                      to={x.url + "/" + sub.slug}
                      key={subIndex}
                      onClick={() => {
                        toggleSubNav(index);
                        setVisibleNav(false);
                      }}
                    >
                      {typeof sub.icon === "string" ? <img src={sub.icon} alt={sub.name || sub.title}
                                                           className={styles.icon} /> : <span
                        className={styles.icon}>{sub.icon}</span>}
                      {sub.name || sub.title}
                    </NavLink>))}
                  </DropdownMenu>

                  : <NavLink
                    className={styles.link}
                    activeClassName={styles.active}
                    to={x.url}
                    key={index}
                    onClick={() => setVisibleNav(false)}
                  >
                    {x.title}
                  </NavLink>

              ))}
            </nav>

            <div className={styles.nav}>
              <Link
                to={multiple ? NAVIGATE_ROUTES.UPLOAD_VARIANTS : `${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${UPLOAD_MODES.SINGLE}`}
                className={cn("button-small", styles.button)}
                onClick={createItem}
              >
                Create
              </Link>
              {!profile.isAuthorized && <button
                className={cn("button-stroke button-small", styles.button, styles.connect)}
                onClick={() => setVisibleModalConnectWallet(true)}
              >
                Connect Wallet
              </button>}
            </div>
          </div>
          {
            profile.isAuthorized && (
              <Link
                to={multiple ? NAVIGATE_ROUTES.UPLOAD_VARIANTS : `${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${UPLOAD_MODES.SINGLE}`}
                className={cn("button-small", styles.button)}
                onClick={createItem}
              >Create</Link>
            )
          }


          {profile.isAuthorized ? <div className={styles.user_menu}>
            <Notification className={styles.notification} />
            <User className={styles.user} />
            <Wallet className={styles.wallet} />
          </div> : <button
            className={cn("button-stroke button-small", styles.button, styles.connect)}
            onClick={() => setVisibleModalConnectWallet(true)}
          >
            Connect Wallet
          </button>}
          <button
            className={cn(styles.burger, { [styles.active]: visibleNav })}
            onClick={switchVisibleNav} />
        </div>
      </header>
      <Modal
        title={'Connect Wallet'}
        visible={visibleModalConnectWallet}
        outerClassName={styles.wallet_modal}
        containerClassName={styles.wallet_modal_container}
        onClose={() => setVisibleModalConnectWallet(false)}
      >
        <ConnectWallet onConnected={() => setVisibleModalConnectWallet(false)} />
      </Modal>
    </>
  );
};

export default Headers;
