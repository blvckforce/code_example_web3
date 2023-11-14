import axios from 'axios';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import SEO from '../../../components/SEO';
import NAVIGATE_ROUTES from '../../../config/routes';
import styles from "./ProfileBody.module.sass";
import Items from "../Items";
import Notice from "../../../components/Notice";
import Loader from "../../../components/Loader";
import CreatedNotification, { NotificationType } from "../Notification";
import Filterable from "../../Filterable";
import Followers from "../Followers";
import API, { AgentServices } from "../../../services/API";
import AgentItems from "../Agent";
import { useHistory } from "react-router";
import CollectionList from "../Collection/CollectionList";

const tabs = {
  on_sale: {
    key: "on_sale",
    label: "On Sale",
    tag: "22",
  },

  owned: {
    key: "owned",
    label: "Owned",
    tag: "22",
  },

  created: {
    key: "created",
    label: "Drafts",
    tag: "22",
  },

  minted: {
    key: "minted",
    label: "Minted",
    tag: "22",
  },
  // likes: {
  //     key: "likes",
  //     label: "Likes",
  //     tag: "22",
  //     stub: "nft"
  // },

  // following: {
  //     key: "following",
  //     label: "Following",
  //     tag: "22",
  // },

  // activity: {
  //     key: "activity",
  //     label: "Activity",
  //     tag: null,
  // },

  collections: {
    key: "collections",
    label: "Collections",
    tag: "22",
  },

  creators: {
    key: "creators",
    label: "Creators",
    tag: "12",
  },
};

const userTabs = ["on_sale", "owned", "created", "minted", "likes", "following", "collections", "activity"];
const agentTabs = ["creators", "on_sale", "created", "minted", "owned", "following", "activity", "collections"];
const artistTabs = ["on_sale", "owned", "created", "minted", "likes", "following", "activity", "collections"];

const nftsTabs = ["on_sale", "owned", "created", "minted", "likes"];

const ProfileBody = ({ profileDetails, toolbars, className, defaultTab, isMyProfile }) => {

  const [items, setItems] = useState([]);
  const [itemsCount, setItemsCount] = useState({});
  const [loading, setLoading] = useState(false);
  const artistDetails = profileDetails.artist || { status: NotificationType.unRegistered };

  const [navTabs, setNavTabs] = useState(userTabs);
  const [activeNavTab, setActiveNavTab] = useState(defaultTab || navTabs[0]);
  const history = useHistory();

  const cancelToken = useRef(null);

  const changeActiveTab = (tab_key) => {
    const tab = tabs[tab_key];
    if (tab && tab_key !== activeNavTab) {
      setItems([]);
      setActiveNavTab(tab_key);
    }
  };

  const fetchItems = useCallback(async (activeNavTab, cancelToken) => {
    if (isNil(profileDetails?.id)) {
      return { data: [] };
    }

    const req = (...props) => isMyProfile ? API.getMyNfts(...props) : API.getNFTs(...props);

    switch (activeNavTab) {
      case "on_sale" : {
        return req("?account=" + profileDetails.id + "&current_page=on_sale", { cancelToken });
      }
      case "created" : {
        return req("?account=" + profileDetails.id + "&current_page=drafts", { cancelToken });
      }
      case "owned" : {
        return req("?account=" + profileDetails.id + "&current_page=owned", { cancelToken });
      }
      case "minted" : {
        return req("?account=" + profileDetails.id + "&current_page=minted", { cancelToken });
      }
      case "likes" : {
        return API.getLikes("?account=" + profileDetails.id, { cancelToken });
      }
      case "followers" : {
        return API.getFollowing(profileDetails.id, { cancelToken });
      }
      case "collections" : {
        if (isMyProfile) return API.getMyCollections({ cancelToken });
        break;
      }
      case "creators" : {
        if (profileDetails?.agent?.id) {
          return AgentServices.getArtists("?agent=" + profileDetails.agent.id + "&status_ne=cancelled", { cancelToken });
        }
        return { data: [] };
      }
      default: {
        return { data: [] };
      }
    }
  }, [profileDetails?.id, profileDetails?.agent?.id, isMyProfile]);

  const registerArtist = () => {
    history.push(NAVIGATE_ROUTES.ARTIST_SIGN_UP);
  };

  const createItem = () => {
    history.push(NAVIGATE_ROUTES.UPLOAD_VARIANTS);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      const currentToken = cancelToken.current;
      if (currentToken) currentToken.cancel();

      cancelToken.current = axios.CancelToken.source();

      const { data } = await fetchItems(activeNavTab, cancelToken.current.token) ?? {};

      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data?.items)) {
        setItems(data.items);
      } else {
        setItems([]);
      }
      cancelToken.current = null;
      setLoading(false);
    })();
  }, [activeNavTab, fetchItems]);

  useEffect(() => {
    let tab = userTabs;

    if (profileDetails) {

      if (profileDetails.agent) {
        tab = agentTabs;
      }

      if (profileDetails.artist) {
        tab = artistTabs;
      }

      if (profileDetails.agent && profileDetails.artist) {
        tab = [...new Set([...artistTabs, ...agentTabs])];
      }
    }

    setNavTabs(tab);

    let baseTab = defaultTab || tab[0];

    if (activeNavTab === baseTab) {
      fetchItems(baseTab).catch();
    }

    setActiveNavTab(baseTab);

  }, [profileDetails, fetchItems]);


  if (process.env.NODE_ENV === "development") window.profile = profileDetails;
  return (
    <>
      <SEO title={`${tabs?.[activeNavTab]?.label ?? ''} | Profile`} url={window.location.href} />
      <div className={cn(className, styles.body)}>
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <>
              {artistDetails.status === NotificationType.pending &&
                <CreatedNotification type={NotificationType.pending} />
              }

              {artistDetails.status === NotificationType.rejected &&
                <CreatedNotification onSuccessClick={registerArtist} type={NotificationType.rejected} />
              }
            </>

            <div className={cn(styles.nav, { [styles.toolbar]: !!toolbars })}>
              <div>
                {navTabs.map(tab_key => (
                    tabs[tab_key] &&
                    <button
                      className={cn(styles.link, {
                        [styles.active]: tab_key === activeNavTab,
                      })}
                      key={tab_key}
                      onClick={() => changeActiveTab(tab_key)}
                    >
                      {tabs[tab_key].label}
                      {
                        (tabs[tab_key].tag && items) &&
                        <span className={styles.tag}>{itemsCount[tab_key]}</span>
                      }
                    </button>
                  ),
                )}
              </div>

              <div className={styles.actions}>{toolbars}</div>
            </div>

            {
              loading === true
                ? (
                  <Loader className={styles.loader} />
                )
                : (
                  <>
                    {nftsTabs.includes(activeNavTab) &&
                      <>
                        {activeNavTab === "created" &&
                          <>
                            {(!items?.length && artistDetails.status === NotificationType.approved) &&
                              <CreatedNotification
                                onSuccessClick={createItem}
                                type={NotificationType.approved}
                              />
                            }
                          </>
                        }
                        {items?.length
                          ? <Items
                            class={styles.items}
                            items={items}
                            stub={tabs[activeNavTab].stub}
                            editable={activeNavTab === "created" && isMyProfile === true}
                            activeNavTab={activeNavTab}
                          />
                          : <Notice message='Empty' />
                        }
                      </>
                    }

                    {
                      activeNavTab === "creators" &&
                      <AgentItems className={styles.creators} items={items} />
                    }

                    {(activeNavTab === "following" || activeNavTab === "followers") && (
                      <Followers className={styles.followers} items={items} />
                    )}

                    {activeNavTab === "collections" && items &&
                      <CollectionList items={items} />
                    }

                    {activeNavTab === "activity" && (
                      <Filterable
                        moduleName='notification'
                        noTitle={true}
                        className={cn(styles.filters, styles.header, styles.top)}
                      />
                    )}
                  </>
                )
            }

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileBody;
