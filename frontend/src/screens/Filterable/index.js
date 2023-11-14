import { size } from 'lodash-es';
import qs from 'qs';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { API_PARAMS, NFT_PARAMS } from "../../config/API_ROUTES";
import { NAVIGATE_PARAMS } from '../../config/routes';
import useFiltersClick from '../../hooks/useFiltersClick';
import { useSettings } from "../../hooks/useSettings";
import { switchObjectInObject } from '../../utils/helpers';
import CollectionView from '../Profile/Collection/CollectionView';
import styles from "./Filterable.module.sass";
import Icon from "../../components/Icon";
import Explore from "./Explore";
import Notice from "../../components/Notice";
import Category from "./Filters/Category";
import Chains from "./Filters/Chains";
import Collection from "./Filters/Collections";
import FilterPanel from "./Filters/FilterPanel";
import PaymentsMethod from "./Filters/PaymentsMethod";
import Properties from './Filters/Properties';
import Status from "./Filters/Status";
import Tags from "./Filters/Tags";
import Notification from "./Notification";
import Activity from "./Activity";
import MobileOverlay from "../../components/Overlay";
import { useParams } from "react-router";
import Price from "./Filters/Price";


const statusOptions = [
  { key: NFT_PARAMS.FIXED_PRICE, label: "Buy now" },
  { key: NFT_PARAMS.AUCTION, label: "On Auction" },
  // { key: "bid", label: "Bid" },
  //{ key: "has_offers", label: "Has Offers" }
];

const tagOptions = [
  { key: "listings", label: "Listings", icon: "tag" },
  { key: "purchase", label: "Purchases", icon: "bag-filled" },
  { key: "sales", label: "Sales", icon: "fire-white" },
  { key: "transfer", label: "Transfer", icon: "swap" },
  { key: "burns", label: "Burns", icon: "broken-bone" },
  { key: "likes", label: "Likes", icon: "heart-full" },
  { key: "following", label: "Following", icon: "tick" },
  { key: "offers", label: "Offers", icon: "data-transfer" },
  { key: "bids", label: "Bids", icon: "auction" },
  { key: "invite", label: "Invites", icon: "invite" },

  // { key: "message", label: "Message", icon: "tag" },
  // { key: "fee", label: "Fees", icon: "fire" },
  // { key: "onboarding", label: "Onboarding", icon: "tag" },
];

const currencyOptions = ["SWAPP", "WETH"];

const Filterable = ({ moduleName = "explore", className, noTitle }) => {

  const params = useParams();
  const {
    chains: chainsOptions,
    categories: categoryOptions,
    payment: paymentOptions,
  } = useSettings();

  const [visible, setVisible] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [priceFilter, setPriceFilter] = useState({
    currency: currencyOptions[0],
    from: 0,
    to: 0,
  });

  const [selections, setSelections] = useState(null);

  const collectionId = useMemo(() => size(selections?.collection) === 1 ? Object.keys(selections?.collection)?.[0] : null, [selections?.collection]);

  /***
   *
   * @type {(function(tag: string, id:string, label: string|{label: string, parent?: string}): void)|*}
   */
  const switchSelections = useCallback((tag, id, value) => {
    setSelections(
      prevState => ({
        ...prevState,
        [tag]: prevState?.[tag]
          ? switchObjectInObject(prevState[tag], id, value)
          : { [id]: value },
      }),
    );
  }, []);

  const resetFilters = () => setSelections(null);

  const applyPriceFilter = () => {
    let filter = priceFilter;
    filter.from = parseFloat(filter.from);
    filter.to = parseFloat(filter.to);
    if (filter.to < filter.from) filter.to = filter.from;

    setSelections(prevState => ({
        ...prevState,
        [API_PARAMS.PRICE]: {
          [API_PARAMS.PRICE]: filter.currency + ": " + filter.from + " - " + filter.to,
        },
      }),
    );
  };


  useEffect(() => {

  }, []);

  const updateResult = useCallback((count) => {
    setResultCount(count);
  }, []);

  const STEP = `0.1`;

  const onCancelFilter = useFiltersClick(switchSelections);

  const filters = {
    status: (
      <Status
        name={API_PARAMS.STATUS}
        statusOptions={statusOptions}
        selections={selections}
        switchSelections={switchSelections}
      />
    ),

    price: (
      <Price
        name={API_PARAMS.PRICE}
        STEP={STEP}
        priceFilter={priceFilter}
        currencyOptions={currencyOptions}
        setPriceFilter={setPriceFilter}
        applyPriceFilter={applyPriceFilter}
      />
    ),

    collection: (
      <Collection
        name={API_PARAMS.COLLECTION}
        switchSelections={switchSelections}
        selections={selections}
      />
    ),

    chains: (
      <Chains
        name={API_PARAMS.CHAIN}
        chainsOptions={chainsOptions}
        switchSelections={switchSelections}
        selections={selections}
      />),

    category: (
      <Category
        name={API_PARAMS.CATEGORY}
        categoryOptions={categoryOptions}
        switchSelections={switchSelections}
        selections={selections}
      />
    ),

    paymentMethod: (
      <PaymentsMethod
        name={API_PARAMS.PAYMENT_METHOD}
        paymentOptions={paymentOptions}
        switchSelections={switchSelections}
        selections={selections}
      />

    ),
    properties: (
      <Properties
        switchSelections={switchSelections}
        selections={selections}
        params={params}
        collectionId={collectionId}
      />
    ),

    tags: (
      <Tags name={API_PARAMS.TAGS}
            switchSelections={switchSelections}
            selections={selections}
            tagOptions={tagOptions} />
    ),
  };

  const moduleComponents = useMemo(() => ({
    explore: {
      component: (
        <Explore
          className={{ [styles.minimize]: visible }}
          filters={selections}
          routeParams={params}
          categories={categoryOptions}
          onResultUpdated={updateResult}
        />
      ),
      filters: [
        filters.status,
        filters.price,
        filters.collection,
        filters.chains,
        params[NAVIGATE_PARAMS.SELECTED_CATEGORY] ? "" : filters.category,
        filters.paymentMethod,
        collectionId ? filters.properties : null,
      ],
    },
    notification: {
      component: (
        <Notification
          className={cn({ [styles.minimize]: visible })}
          noTitle={noTitle}
          filters={selections}
          onResultUpdated={updateResult}
        />
      ),
      filters: [filters.tags],
    },
    activity: {
      component: (
        <Activity
          className={{ [styles.minimize]: visible }}
          filters={selections}
          onResultUpdated={updateResult}
        />
      ),
      filters: [filters.status, filters.price, filters.category],
    },
    collection: {
      component: (
        <CollectionView
          isProfilePage={false}
          filters={selections}
          onResultUpdated={updateResult} />
      ),
      filters: [
        filters.status,
        filters.price,
        filters.chains,
        filters.paymentMethod,
        filters.properties,
      ],
    },
  }), [filters.category, filters.chains, filters.collection,
    filters.paymentMethod, filters.price, filters.status, filters.tags, noTitle,
    params, selections, visible, collectionId]);

  const module = moduleComponents[moduleName];


  return module ? (
    <div
      className={cn("section-pt0", styles.section, {
        [styles.minimize]: visible,
      })}
    >
      <div className={styles.row}>
        <FilterPanel className={cn(styles.mobile_filter, className)}
                     setVisible={setVisible}
                     filters={module.filters}
        />
        <div className='inner-container'>
          <div
            className={cn(styles.wrapper, {
              [styles.no_filter]: !selections,
            })}
          >
            {selections && (
              <div className={styles.top}>
                <div className={styles.result}>{resultCount} results</div>
                <div className={styles.selections}>
                  {
                    Object.entries(selections).map(([key, dataObject]) => (
                      Object.entries(dataObject || {}).map(([id, data], index) => (
                          <button
                            key={index}
                            className={cn("button-small", styles.filter_button)}
                            onClick={onCancelFilter(key, id, '')}
                          >
                            {data.label ?? data}
                            <Icon name='close' size='12' />
                          </button>
                        ),
                      )
                    ))
                  }
                  <button className={styles.reset} onClick={resetFilters}>
                    Clear all
                  </button>
                </div>
              </div>
            )}
            <div className={styles.body}>{module.component}</div>
          </div>
        </div>
      </div>
      <MobileOverlay
        className={styles.mobile}
        fullScreenContent={<FilterPanel setVisible={setVisible} filters={module.filters} />}
        fabContent={
          <span className={styles.title}>
                            <Icon name='filter-light' size='24' />
                            Filter
                        </span>
        }
      />
    </div>
  ) : (
    <Notice message={moduleName + " Not Found"} type='Error' />
  );
};


export default Filterable;
