import qs from 'qs';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import SlickArrow from "../../../components/SlickArrow";
import { API_PARAMS, PAGINATION } from '../../../config/API_ROUTES';
import NAVIGATE_ROUTES from "../../../config/routes";
import { parseImageOrSmile } from "../../../utils/helpers";
import styles from "./Discover.module.sass";
import { Range, getTrackBackground } from "react-range";
import Slider from "react-slick";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import API from "../../../services/API";

import LoaderCircle from "../../../components/LoaderCircle";
import Notice from "../../../components/Notice";

const navLinks = [
  { name: "All", icon: "", id: 0 },
];
const priceOptions = ["", "Highest price", "The lowest price"];
const likesOptions = ["", "Most liked", "Least liked"];
const creatorOptions = ["All", "Verified only"];

const Discover = ({ title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [price, setPrice] = useState(priceOptions[0]);
  const [likes, setLikes] = useState(likesOptions[0]);
  const [creator, setCreator] = useState(creatorOptions[0]);

  const STEP = 5;
  const MIN = 10;
  const MAX = 1000000;
  const [ranges, setRanges] = useState([MAX]);

  const [visible, setVisible] = useState(false);

  const [categories, setCategories] = useState(navLinks);
  const [isLoading, setLoading] = useState(true);
  const [items, setItems] = useState([]);


  const navLinksDefaultLimit = 5;
  const [navLinksLimit, setNavLinksLimit] = useState(navLinksDefaultLimit);
  let revealNav = navLinksLimit === navLinksDefaultLimit;

  const [visibleMenu, setVisibleMenu] = useState(false);
  const [currentItem, setCurrentItem] = useState();
  const toggleMenu = (evt, itemIndex) => {
    evt.preventDefault();
    setCurrentItem(itemIndex);
    return setVisibleMenu(!visibleMenu);
  };

  const loadNFTs = async () => {
    const limit = 8;
    let sort = "";
    let where = "";

    if (visible) {

      if (price)
        sort = `price:${price === priceOptions[1] ? "DESC" : "ASC"},`;

      // if (likes)
      //   sort = `${sort}total_likes:${likes == likesOptions[1] ? "DESC" : "ASC"}`;

      where = `&price_gte=${MIN}&price_lte=${ranges[0]}`;
      where = `${where}${creator === creatorOptions[0] ? "" : "&account.verified=true"}`;
    }

    const category = activeIndex ? "&category=" + categories[activeIndex].id : "";

    setLoading(true);

    const params = qs.stringify({
      [PAGINATION.LIMIT]: limit,
      ...(sort && { [PAGINATION.SORT]: sort }),
      [API_PARAMS.CATEGORY]: category,
    });
    // `{limit}=${limit}&_sort=${sort ? sort : 'updated_at:DESC'}${category}${where}`
    const resp = await API.getNFTs(`?${params}`);
    setLoading(false);

    if (resp.error)
      return;

    let data = resp.data;
    setItems(data);
  };


  useEffect(() => {

    loadNFTs().catch();

  }, [activeIndex, price, likes, creator, ranges, visible]);


  useEffect(() => {

    API.getCategories().then((resp) => {

      if (resp.error)
        return;

      setCategories([...navLinks, ...resp.data]);
    });
  }, []);


  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.top}>
          <h3 className={cn("h3")}>{title}</h3>
          <div className={cn(styles.nav)}>
            {categories.slice(0, navLinksLimit).map((x, index) => (
              <button
                className={cn(styles.link, {
                  [styles.active]: index === activeIndex,
                })}
                onClick={() => setActiveIndex(index)}
                key={index}
              >
                <span>{x.name}</span>
                {
                  x.icon !== undefined && parseImageOrSmile(x.icon)
                    ? <img src={x.icon} alt={x.name} className={styles.img} />
                    : <span className={styles.icon}>{x.icon}</span>
                }
                {x.tag && <span className={styles.tag}>{x.tag}</span>}
              </button>
            ))}
            {categories.length > 5 &&
              <button className={cn(styles.nav, styles.ellipsis, {
                [styles.active]: !revealNav,
              })} onClick={() => setNavLinksLimit(revealNav ? categories.length : navLinksDefaultLimit)}>
                {revealNav ? <span>...</span> : <span>:</span>}

              </button>
            }
          </div>
          <div className={cn("tablet-show", styles.dropdown)}>
            <Dropdown
              className={styles.dropdown}
              value={categories[activeIndex].id}
              setValue={(value) => setActiveIndex(value)}
              options={categories}
              label_index='name'
              value_index='id'
              defaultLabel={categories[activeIndex].label}
            />
          </div>
          <button
            className={cn(styles.filter, { [styles.active]: visible })}
            onClick={() => setVisible(!visible)}
          >
            <div className={styles.toggle}>
              <Icon name='filter-light' size='18' />
              <Icon name='close' size='10' />
            </div>
            <div className={styles.text}>Filter</div>

          </button>
        </div>
        <div className={cn(styles.filters, { [styles.active]: visible })}>
          <div className={styles.sorting}>
            <div className={styles.cell}>
              <div className={styles.label}>Price</div>
              <Dropdown
                className={styles.dropdown}
                value={price}
                setValue={setPrice}
                options={priceOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>likes</div>
              <Dropdown
                className={styles.dropdown}
                value={likes}
                setValue={setLikes}
                options={likesOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>creator</div>
              <Dropdown
                className={styles.dropdown}
                value={creator}
                setValue={setCreator}
                options={creatorOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>Price range</div>
              <Range
                values={ranges}
                step={STEP}
                min={MIN}
                max={MAX}
                onChange={(values) => setRanges(values)}
                renderTrack={({ props, children }) => (
                  <div
                    onMouseDown={props.onMouseDown}
                    onTouchStart={props.onTouchStart}
                    style={{
                      ...props.style,
                      height: "27px",
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    <div
                      ref={props.ref}
                      style={{
                        height: "8px",
                        width: "100%",
                        borderRadius: "4px",
                        background: getTrackBackground({
                          values: ranges,
                          colors: ["#3772FF", "#E6E8EC"],
                          min: MIN,
                          max: MAX,
                        }),
                        alignSelf: "center",
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props, isDragged }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "24px",
                      width: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#3772FF",
                      border: "4px solid #FCFCFD",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-33px",
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "14px",
                        lineHeight: "18px",
                        fontFamily: "Poppins",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        backgroundColor: "#141416",
                      }}
                    >
                      {ranges[0].toFixed(1)}
                    </div>
                  </div>
                )}
              />
              <div className={styles.scale}>
                <div className={cn("currency", "small no-icon", styles.number)}>{MIN}</div>
                <div className={cn("currency", "small no-icon", styles.number)}>{MAX}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.list}>
          {isLoading ?
            <LoaderCircle className='loading-circle' />
            :
            <Slider
              className={cn("discover-slider", styles.slider)}
              {...settings}
            >
              {items?.map((x, index) => (
                <Card
                  className={styles.card} item={x} key={x.id}
                  visibleMenu={visibleMenu && currentItem === index}
                  toggleMenu={(evt) => toggleMenu(evt, index)}
                />
              ))}
              {!items?.length && <Notice message='No match found' type='INFO' />}
            </Slider>
          }
        </div>
        <div className={styles.btns}>
          <Link to={NAVIGATE_ROUTES.EXPLORE} className={cn("button-stroke button-small button-full", styles.button)}>
            <span>Load more</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  nextArrow: (
    <SlickArrow>
      <Icon name='arrow-next' size='14' />
    </SlickArrow>
  ),
  prevArrow: (
    <SlickArrow>
      <Icon name='arrow-prev' size='14' />
    </SlickArrow>
  ),
  responsive: [
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 100000,
      settings: "unslick",
    },
  ],
};

export default Discover;
