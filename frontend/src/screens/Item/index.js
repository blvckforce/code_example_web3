import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { useHistory, useParams } from "react-router";
import ItemMenu from "../../components/ItemMenu";
import SEO from '../../components/SEO';
import SourceContainer from "../../components/SourceContainer";
import NAVIGATE_ROUTES from "../../config/routes";
import { useGlobalState } from "../../contexts/Global";
import ItemTabs, { tabs } from './Components/Tabs';

import Control from "./Control";
import LoaderCircle from "../../components/LoaderCircle";
import Notice from "../../components/Notice";
import Price from "../../components/Price";
import { getUserAgent } from "../../utils/wallet";
import styles from "./Item.module.sass";
import Image from "../../components/Image";
import classes from "../../components/UnsupportedChainModal/styles.module.css";
import Modal from "../../components/Modal";
import { NFTRequest } from "../../utils/requests";

const Item = () => {


  const { id = -1 } = useParams();
  const value = !isNaN(+id) ? +id : -1;
  const { goBack, push } = useHistory();
  const { account } = useGlobalState();

  const [activeIndex, setActiveIndex] = useState(tabs[0]);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
  const [visibleUnLockableContent, setVisibleUnLockableContent] = useState(false);
  const [error, setError] = useState("");
  const [creator, setCreator] = useState({});
  const [agent, setAgent] = useState(null);

  const [isOwner, setIsOwner] = useState(false);

  const updateItem = (item) => {
    setItem(item);
  };

  const nftItems = [creator, {
    position: "Collection",
    avatar: item?.colection?.avatar,
    name: item?.colection?.name,
  }, {
    position: "Category",
    avatar: item?.category?.icon ?? "/images/category.png",
    name: item?.category?.name,
  }, agent ? {
    position: "Agent",
    avatar: agent?.avatar,
    name: agent?.name,
  } : null];

  useEffect(() => {
    if (value <= 0) goBack();
  }, [value, goBack]);

  useEffect(() => {
    (async () => {     // You can await here

      if (item?.account) {
        const creatorData = {
          position: "Creator",
          name: item.account.name,
          avatar: item.account.avatar,
        };

        setCreator(creatorData);

        if (item?.account?.artist) {
          const agentData = await getUserAgent(item.account.artist);

          if (agentData) {
            setAgent(agentData);
          }
        }
      }
    })();
  }, [item]);

  const fetchItem = useCallback(async () => {

    if (value <= 0) return;

    try {
      setLoading(true);

      const nft = await NFTRequest.getDetails(value);

      if (!nft) {
        setError("Item not found");
        setLoading(false);
      } else {
        const { mode, account: { address } = {} } = nft;

        const owner = account && address?.toLowerCase() === account.toLowerCase();

        if (nft.is_minted === false && owner && mode) {
          push(`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${mode}/${value}`);
        } else {
          setItem(nft);
        }
        setLoading(false);
      }

    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }, [account, push, value]);

  useEffect(() => {
    fetchItem().catch();
  }, [fetchItem]);

  useEffect(() => {
    setIsOwner(account === item?.account?.address);
  }, [account, item]);

  if (error && !loading) {
    return <Notice message={error} type='Info' />;
  }

  if (loading) {
    return <LoaderCircle className={styles.loader} />;
  }

  const price = item.price || item.bid;

  if (process.env.NODE_ENV) window.item = item; /* FIXME: remove */

  return (
    <>
      <SEO title={item.name}
           description={item.description}
           image={item.image} url={window.location.href}
      />

      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.bg}>
            <div className={styles.preview}>
              <div className={styles.categories}>
                {/*{categories.map((x, index) => (*/}
                {/*    <div*/}
                {/*        className={cn(*/}
                {/*            { "status-black": x.category === "black" },*/}
                {/*            { "status-purple": x.category === "purple" },*/}
                {/*            styles.category*/}
                {/*        )}*/}
                {/*        key={index}*/}
                {/*    >*/}
                {/*        {x.content}*/}
                {/*    </div>*/}
                {/*))}*/}
              </div>
              <SourceContainer url={item.image} alt={item.name} controls />
            </div>
          </div>
          <div className={styles.details}>
            <div>
              {item && <ItemMenu className={styles.menuBtn} item={item} />}
              <h1 className={cn("h3", styles.title)}>{item.name}</h1>
            </div>


            <div className={styles.cost}>
              <div className={cn("status-stroke-green", styles.price)}>
                {price} {item.currency}
              </div>
              {
                !!price &&
                <div className={cn("status-stroke-black", styles.price)}>
                  <Price price={price} currency={item.currency} convertTo='USD' convertToSymbol='$'
                         showSymbol={true} showCurrency={false} />
                </div>
              }
              <div className={styles.counter}>{item.quantity} in stock</div>
              {item.unlockable && (
                <>
                  <button
                    className={cn("button", styles.unlockableBtn)}
                    onClick={() => setVisibleUnLockableContent(true)}
                  >
                      <span>
                        <Image
                          src={"/images/content/document.svg"}
                        />
                      </span>
                  </button>
                  <Modal visible={visibleUnLockableContent}
                         outerClassName={styles.modelRichText}
                         onClose={() => setVisibleUnLockableContent(false)}
                  >
                    <div className={classes.root}>
                      <h3>Unlockable Content</h3>
                      {item.unlockable}
                    </div>
                  </Modal>
                </>
              )}
            </div>
            <div className={styles.info}>
              {item.description}
            </div>
            <div className={styles.nav}>
              {tabs.map((name) => (
                <button
                  className={cn(
                    { [styles.active]: name === activeIndex },
                    styles.link,
                  )}
                  onClick={() => setActiveIndex(name)}
                  key={name}
                >
                  {name}
                </button>
              ))}
            </div>

            <ItemTabs nftItems={nftItems} active={activeIndex} isOwner={isOwner} itemId={item?.id} />
            {/*REFACTOR*/}
            <Control className={styles.control} item={item} updateItem={updateItem} agent={agent} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Item;
