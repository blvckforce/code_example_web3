import axios from 'axios';
import qs from 'qs';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import SEO from '../../../components/SEO';
import { API_PARAMS, PAGINATION } from '../../../config/API_ROUTES';
import { NAVIGATE_PARAMS } from '../../../config/routes';
import { useSettings } from '../../../hooks/useSettings';
import styles from "./Explore.module.sass";
import Card from "../../../components/Card";
import LoaderCircle from "../../../components/LoaderCircle";
import Notice from "../../../components/Notice";
import { filtersToQueryParams } from "../../../utils/helpers";
import { toast } from "react-hot-toast";
import { NFTRequest } from "../../../utils/requests";

const Explore = ({ className, filters, onResultUpdated, routeParams }) => {

  const { categories } = useSettings();

  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const pageLimit = 20;

  const [visibleMenu, setVisibleMenu] = useState(false);
  const [currentItem, setCurrentItem] = useState();


  const currentRequest = useRef(null);

  const toggleMenu = (evt, itemIndex) => {
    evt.preventDefault();
    setCurrentItem(itemIndex);
    return setVisibleMenu(!visibleMenu);
  };

  const cat = useMemo(() => {
    if (routeParams?.[NAVIGATE_PARAMS.SELECTED_CATEGORY]) {
      if (routeParams[NAVIGATE_PARAMS.SELECTED_CATEGORY].toLowerCase() !== 'all') {
        const cat = categories?.find(({ slug }) => slug.toLowerCase() === routeParams[NAVIGATE_PARAMS.SELECTED_CATEGORY]?.toLowerCase());
        return { id: cat?.id, name: cat?.name };
      }
    }
    return {
      id: undefined, name: undefined,
    };
  }, [categories, routeParams]);

  const buyItem = async (_item) => {
    //buyNft(_item.tokenId, _item.price)
  };

  const getNFTs = useCallback(async (page = 0) => {

    try {
      setLoading(true);


      let queryFilters = filtersToQueryParams(filters);

      let params = qs.stringify({
        [PAGINATION.LIMIT]: pageLimit,
        [PAGINATION.OFFSET]: pageLimit * page,
        ...(cat?.id ? { [API_PARAMS.CATEGORY]: cat.id } : {}),
      });

      params = `${params}&${queryFilters}`;


      if (currentRequest.current) currentRequest.current.cancel();

      const cancelToken = axios.CancelToken.source();
      currentRequest.current = cancelToken;

      const resp = await NFTRequest.getDetails(`?${params}`, { cancelToken: cancelToken.token });

      if (Array.isArray(resp.items)) onResultUpdated(resp.count);

      if (page !== 0) {
        setItems(prevState => Array.isArray(resp.items) ? prevState.concat(resp.items) : prevState);
      } else setItems(Array.isArray(resp.items) ? resp.items : []);

    } catch (e) {
      console.log(e);
      toast.error("Can't load market list");
      setError("Can't load market list");
    } finally {
      setLoading(false);
      currentRequest.current = null;
    }

  }, [cat?.id, filters, onResultUpdated]);

  //
  //   let data = page > 0 ? [...items, ...resp.data] : resp.data;
  //
  //   if (queryParams) {
  //
  //     const count = data.length;
  //     onResultUpdated(count < searLimit ? count : count + "+");
  //   }
  //
  //   if (!data.length)
  //     setError("Empty");
  //
  //   setItems(data);
  // };

  const resetParams = (params = '') => {
    setCurrentPage(0);
    setItems([]);
  };

  const loadMore = () => {
    const page = currentPage + 1;
    setCurrentPage(page);
    getNFTs(page).catch();
  };

  useLayoutEffect(() => {
    resetParams();
  }, [cat?.id]);

  useEffect(() => {
    getNFTs().catch();
  }, [getNFTs]);

  if (error) {
    return <>
      <SEO title={'Explore NFTs'} url={window.location.href} />
      <Notice message={error} type='error' />;
    </>;
  }

  return (
    <>
      <SEO title={`Explore NFTs ${cat?.name && '| ' + cat.name}`} url={window.location.href} />

      <div className={cn(className, styles.list)}>
        {items?.map?.((x, index) => (
          <Card
            key={index}
            className={styles.card}
            item={x}
            withMenu
            buyItem={(_item) => buyItem(_item)}
            visibleMenu={visibleMenu && currentItem === index}
            toggleMenu={(evt) => toggleMenu(evt, index)}
          />
        ))}
      </div>
      {isLoading && <LoaderCircle className={styles.loader} />}
      {items?.length >= pageLimit &&
        <div className={styles.btns}>
          <button className={cn("button-stroke", styles.button)} onClick={loadMore}>
            <span>Load more</span>
          </button>
        </div>
      }
    </>
  );

};

export default Explore;
