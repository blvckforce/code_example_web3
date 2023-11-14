import cn from 'classnames';
import { round, toLower } from 'lodash-es';
import React from 'react';
import { Link } from 'react-router-dom';
import NAVIGATE_ROUTES from '../../config/routes';
import Image from '../Image';
import styles from './Card.module.sass';
import UnderBlock from './under-block';

const CardBody = ({ item, activeNavTab, isPreview, mode }) => {


  const bidMode = mode === "bid" || item?.type === "bid";
  // const fixed = mode === "fixed" || item?.type === "fixed";

  const price = round(bidMode
    ? +item.bid
    // (+item.highest_bid || +item.bid)
    : +item.price, 6);

  const name = item?.account?.name ?? item.account?.address ?? "";

  if (activeNavTab === "drafts" || activeNavTab === "created" || isPreview) {
    return <span className={styles.footer}>
      <BodyContent item={item} bidMode={bidMode} name={name} price={price} />
    </span>;
  }

  if (activeNavTab === "owned") {

    if (item.on_sale || (!item.on_sale && item.is_minted)) {
      return <span className={styles.footer}>
          <Link className={styles.link} to={`${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}`}
                title={"Navigate to item page"} />
           <BodyContent item={item} bidMode={bidMode} name={name} price={price} />
        </span>;
    }

    if (!item.on_sale && !item.is_minted) {
      return <span className={styles.footer}>
                    <Link className={styles.link} to={`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/${item.mode}:${item.id}`}
                          title={"Navigate to edit details"} />
              <BodyContent item={item} bidMode={bidMode} name={name} price={price} />
        </span>;
    }


    return <span className={styles.footer}>
                  <Link className={styles.link}
                        to={`${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id || item.token_id} `}
                        title={"Navigate to item page"} />
          <BodyContent item={item} bidMode={bidMode} name={name} price={price} />
      </span>;
  }

  return (
    <span className={styles.footer}>
                    <Link className={styles.link} to={`${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}`}
                          title={"Navigate to item page"} />
             <BodyContent item={item} bidMode={bidMode} name={name} price={price} />
          </span>
  );
};

const BodyContent = ({ name, item, bidMode, price }) => (
  <>
    <div className={cn(styles.body)}>
      <div className={cn("row", styles.line)}>
        <div className={styles.desc}>
          <div className='row'>
            {!!name && <p className={styles.name}>{name}</p>}
            {item?.account?.verified &&
              <span className={styles.gap}>
                      <Image src='/images/content/verified_account_primary.png' />
                  </span>
            }
          </div>
        </div>
      </div>
      <div className={styles.line}>
        <p className={styles.titleWrapper}>
          <span className={styles.title}>{item.name}</span>
        </p>
        {
          !!price
            ? (
              <div className={styles.status}>
                <p className={styles.desc}>
                  {bidMode ? "Minimum bid" : "Price"}
                </p>

                <span className={cn(
                  "currency", "n2", "small", "light",
                  { "eth": toLower(item.currency) === "ether" || toLower(item.currency) === "eth" },
                  { "weth": toLower(item.currency) === "weth" },
                )}>
                  {` ${price}`}
                </span>
              </div>
            ) : (
              <div className={styles.desc}>
                 <span className={cn(
                   "currency", "n2", "small", "light",
                   { "eth": toLower(item.currency) === "ether" || toLower(item.currency) === "eth" },
                   { "weth": toLower(item.currency) === "weth" },
                 )} />
              </div>
            )
        }
      </div>
      {
        !price && (
          <p className={styles.desc}>Not for sale</p>
        )
      }
    </div>

    <UnderBlock bidMode={bidMode} item={item} />
  </>
);

export default CardBody;
