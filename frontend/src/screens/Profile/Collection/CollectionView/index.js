import { debounce } from 'lodash-es';
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import cn from "classnames";
import SearchInput from '../../../../components/SearchInput';
import SEO from '../../../../components/SEO';
import { NFT_PARAMS } from '../../../../config/API_ROUTES';

import { useProfile } from "../../../../contexts/profile.context";
import API from "../../../../services/API";

import Card from "../../../../components/Card";
import { filtersToQueryParams } from '../../../../utils/helpers';
import { ITEM_TYPES } from '../../../Item/Components/PutOnSaleForm';
import styles from "./CollectionsView.module.sass";
import Cover from "../../../../components/Cover";
import Details from "../../../../components/Details";
import Modal from "../../../../components/Modal";
import CollectionForm from "../CollectionForm";
import { updateCollection } from "../../../../utils/wallet";

const CollectionView = ({ isProfilePage = true, filters, onResultUpdated }) => {


  const { profile } = useProfile();

  const { profileID, collectionID } = useParams();

  const [collectionItems, setCollectionItems] = useState([]);
  const [collection, setCollection] = useState({});

  const [nameQuery, setNameQuery] = useState('');

  const [visibleCollection, setVisibleCollection] = useState(false);

  const switchVisibleCollection = () => setVisibleCollection(prevState => !prevState);

  const canEdit = profile?.isAuthorized && collection?.account?.id === profile?.account?.id;

  const saveCoverPhoto = async (formData, sign, signer, content) => {
    const file = formData.get('files');
    formData.delete('files');
    formData.delete('field');
    formData.append("files_background", file, "background");
    return updateCollection(
      collection.id,
      profile?.account?.address,
      formData,
      sign,
      signer,
    );
  };

  const onAdded = (collection) => {
    setCollection(collection);
  };

  const getCollectionItems = useCallback(async () => {

    let collectionData;
    const query = filtersToQueryParams(filters);

    if (collectionID) {
      if (isProfilePage) {
        collectionData = await API.getMyNFTsByCollectionId(collectionID, query);
      } else {
        collectionData = await API.getNFTsByCollectionId(collectionID, {
          [NFT_PARAMS.MINTED]: true,
          ...(nameQuery && { [NFT_PARAMS.NAME_CONTAINS]: nameQuery }),
        }, query);
      }
    }

    if (typeof onResultUpdated === 'function') onResultUpdated(collectionData?.data?.count ?? 0);
    setCollectionItems(collectionData?.data?.items ?? []);

  }, [collectionID, filters, isProfilePage, onResultUpdated, nameQuery]);

  const getCollection = useCallback(async () => {
    if (collectionID) {
      const { data = {} } = await API.getCollection(collectionID) ?? {};

      setCollection(data);
    }
  }, [collectionID]);

  useEffect(() => {
    getCollectionItems().catch();
    getCollection().catch();

  }, [profileID, profile, getCollection, getCollectionItems]);


  const updateQuery = (e) => setNameQuery(e?.target?.value);
  const debouncedOnChange = debounce(updateQuery, 200);

  if (process.env.NODE_ENV === 'development') window.collection = collectionItems;


  return (
    <>
      <SEO title={collection.name} url={window.location.href} />
      <div className={"container"}>
        <Cover details={collection} canEdit={canEdit} saveCoverPhoto={saveCoverPhoto} compact={!isProfilePage} />
        <Details
          className={styles.user}
          details={collection}
          canEdit={canEdit}
          onEdit={switchVisibleCollection}
          editBtnText={"Edit collection"}
        />
        <div className={styles.tabs}>
          <div className={cn(styles.tabButton, styles.active)}>
            Items
            <span className={styles.itemsAmount}>{collectionItems.count}</span>
          </div>
          <div className={cn(styles.tabButton)}>Activity</div>
        </div>


        <div className='container'>
          <SearchInput className={styles.search}
                       inputClassName={styles.input}
                       onSubmit={e => e.preventDefault()}
                       autoComplete='off'
                       onChange={debouncedOnChange}
          />
        </div>

        <div className={cn("container", styles.itemsBlock)}>
          {
            collectionItems?.map((item) => (
              <Card
                key={item.id}
                item={item}
                mode={item.mode ?? ITEM_TYPES.FIXED}
                withMenu={!isProfilePage}
              />
            ))
          }
        </div>
        <Modal
          outerClassName={styles.modal}
          visible={visibleCollection}
          onClose={switchVisibleCollection}
        >
          <CollectionForm
            collectionId={collection.id}
            onClose={switchVisibleCollection}
            onAdded={onAdded}
            btnText={"Edit Collection"}
            title={"Edit collection"}
            defaultValues={{
              images: {
                avatar: collection.avatar,
                background: collection.background,
              },
              ...collection,
            }}
          />
        </Modal>
      </div>
    </>
  );
};

export default CollectionView;
