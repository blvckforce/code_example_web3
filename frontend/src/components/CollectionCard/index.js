import React from "react";
import { Link } from "react-router-dom";
import collectionsFlags from "../../flags/collectionsFlags";

import { backendUrl } from "../../utils/helpers";
import Icon from "../Icon";
import Likes from "../Likes";
import styles from "./CollectionCard.module.sass";

const { likes, options } = collectionsFlags;

const CollectionCard = ({ item, link, count }) => {


  return (
    <Link className={styles.collectionCard} to={link}>
      <div className={styles.header}>
        {
          options &&
          <button
            className='button-no-outline'
            onClick={() => null}
          >
            <Icon name='more' size='25' />
          </button>
        }
        {
          likes &&
          <div className={styles.likesWrapper}>
            <Likes totalLikes='12' onLike={() => {
            }} />
          </div>
        }
      </div>
      <div className={styles.preview}>
        {
          item.background
            ? <img className={styles.backgroundImage} src={backendUrl(item.background)} alt='NFT' />
            : <div className={styles.backgroundImage} />
        }
        <div className={styles.avatarBlock}>
          <div className={styles.avatarWrapper}>
            {
              item.avatar
                ? <img
                  className={styles.avatarImage}
                  src={backendUrl(item.avatar)}
                  alt='Avatar'
                />
                : <div className={styles.avatarImage} />
            }
          </div>
          <div className={styles.badge}>
            <Icon name='approved' size='37' />
          </div>
        </div>
      </div>
      <div className={styles.name}>{item.name}</div>
      <div className={styles.tag}>{item.tag}</div>
      {
        count !== undefined &&
        <div className={styles.counter}>
          <span>{count}</span> items
        </div>
      }
    </Link>
  );
};

export default CollectionCard;
