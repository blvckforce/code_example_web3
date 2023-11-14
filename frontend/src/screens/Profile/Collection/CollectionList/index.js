import React, { useEffect, useState } from "react";
import cn from "classnames";
import NAVIGATE_ROUTES from '../../../../config/routes';
import API from "../../../../services/API";
import styles from "./CollectionsList.module.sass";
import Modal from "../../../../components/Modal";
import CollectionCard from "../../../../components/CollectionCard";
import CollectionForm from "../CollectionForm";

const CollectionList = ({ items = [] }) => {
  const [visibleCollection, setVisibleCollection] = useState(false);


  const [collections, setCollections] = useState(items);
  const [collectionsItems, setCollectionsItems] = useState(null);

  // update UI w/o +1 request
  const onAdded = (collection) => {
    setCollections(prevState => [...prevState, collection]);
  };

  useEffect(() => {

    if (Array.isArray(items) && items?.length) {
      (async () => {
        try {

          const resp = await API.getMyNfts();

          if (!resp.error && resp.data) {

            const _temp = {};
            if (Array.isArray(resp.data?.items)) {
              resp.data.items.forEach(({ colectionId } = {}) => {
                _temp[colectionId] = _temp[colectionId] ? _temp[colectionId] + 1 : 1;
              });
            }
            setCollectionsItems(_temp);
          }
        } catch (e) {
          console.error(e);
          setCollectionsItems(null);
        }
      })();
    }
  }, [items]);

  const switchVisibleCollection = () => setVisibleCollection(prevState => !prevState);

  return (
    <>
      <div className={styles.head}>
        <button
          className={cn("button", styles.button)}
          onClick={switchVisibleCollection}
        >
          Create new collection
        </button>
      </div>
      <div className={styles.container}>
        <div className={styles.collectionList}>
          {collections?.map(item => (
            <CollectionCard
              key={item.id}
              item={item}
              link={`${NAVIGATE_ROUTES.PROFILE}${NAVIGATE_ROUTES.COLLECTION_VIEW}/${item.id}`}
              count={collectionsItems?.[item.id] ?? 0}
            />
          ))}
        </div>
      </div>
      <Modal
        outerClassName={styles.modal}
        visible={visibleCollection}
        onClose={switchVisibleCollection}
      >
        <CollectionForm onClose={switchVisibleCollection} onAdded={onAdded} />
      </Modal>
    </>
  );
};

export default CollectionList;
