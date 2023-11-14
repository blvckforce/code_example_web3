import axios from 'axios';
import { debounce } from 'lodash-es';
import qs from 'qs';
import React, { useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { NFT_PARAMS, PAGINATION } from '../../../config/API_ROUTES';
import NAVIGATE_ROUTES from "../../../config/routes";
import { backendUrl, filterDefaultCollection } from "../../../utils/helpers";
import styles from "./Search.module.sass";
import SearchInput from "../../SearchInput";
import Loader from "../../Loader";
import API from "../../../services/API";
import OutsideClickHandler from "react-outside-click-handler";


const Search = () => {

  const [nfts, setNfts] = useState(null);
  const [collections, setCollections] = useState(null);

  const [searchString, setSearchString] = useState('');
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  const currentToken = useRef(null);

  const searchNFT = useCallback(async (text) => {

    if (!text.length) {
      reset();
      return;
    }

    setBusy(true);

    const query = qs.stringify({
      [NFT_PARAMS.NAME_CONTAINS]: text,
      [PAGINATION.LIMIT]: 10,
      [NFT_PARAMS.MINTED]: true,
    });

    if (currentToken.current) {
      currentToken.current.cancel();
    }

    const cancelToken = axios.CancelToken.source();
    currentToken.current = cancelToken;

    const resp = await API.getNFTs(`?${query}`, { cancelToken: cancelToken.token });

    const colQuery = qs.stringify({
      [NFT_PARAMS.NAME_CONTAINS]: text,
      [PAGINATION.LIMIT]: 10,
    });

    const collections = await API.getCollections(`?${colQuery}`, { cancelToken: cancelToken.token });

    if (collections.data && !collections.error) {

      setCollections(filterDefaultCollection(collections.data));
    }

    if (resp.data && !resp.error) {
      setNfts(resp.data.items ?? []);
      setRequested(true);
    }

    setBusy(false);
    currentToken.current = null
  }, []);

  const reset = () => {
    setNfts(null);
    setCollections(null);
  };

  useEffect(() => {
    if (searchString) searchNFT(searchString).catch();
    if(!searchString && requested) reset()
  }, [searchNFT, searchString, requested]);

  const updateSearchString = (e) => setSearchString(e?.target?.value);
  const debouncedOnChange = debounce(updateSearchString, 300);

  return (

    <div className={styles.search_container}>
      <OutsideClickHandler onOutsideClick={reset}>
        <SearchInput
          className={styles.search}
          inputClassName={styles.input}
          iconClassName={styles.result}
          iconDirection='right'
          placeholder='Search by creator or collectible'
          autoComplete='off'
          onSubmit={(e) => e.preventDefault()}
          onChange={debouncedOnChange}
        />

        <div className={cn(styles.search_result, { [styles.active]: nfts || collections || busy })}>

          {busy &&
            <div className={styles.loader}>
              <Loader />
            </div>
          }
          {
            !nfts?.length && !collections?.length && requested &&
            <div className={styles.loader}>
              <h4>Nothing was found</h4>
            </div>
          }
          {
            !!nfts?.length && (
              <h3>
                NFTs
              </h3>
            )
          }
          {nfts?.map((item, index) => (
              <Link className={styles.search_result_item} key={index}
                    to={`${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id}`}
                    onClick={reset}>
                <img src={item.image || "/images/content/nft.png"} alt={"NFT " + item.name} className={styles.img} />
                <span>{item.name}</span>
              </Link>
            ),
          )}
          {
            !!collections?.length && (
              <h3>Collections</h3>
            )
          }
          {
            collections?.map((collection, ind) => (
              <Link className={styles.search_result_item} key={collection.id}
                /*FIXME: need to add this for collection view*/
                    to={`${NAVIGATE_ROUTES.COLLECTION_VIEW}/${collection.id}`}
                    onClick={reset}
              >
                <img src={backendUrl(collection.avatar)} alt={"Collection " + collection.name} />
                <span>{collection.name}</span>
              </Link>
            ))
          }
        </div>
      </OutsideClickHandler>
    </div>

  );
};

export default Search;
