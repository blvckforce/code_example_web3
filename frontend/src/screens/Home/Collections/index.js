import React from "react";
import cn from "classnames";
import Slider from "react-slick";
import CollectionCard from '../../../components/CollectionCard';
import LoaderCircle from "../../../components/LoaderCircle";
import SlickArrow from "../../../components/SlickArrow";
import NAVIGATE_ROUTES from "../../../config/routes";
import useHomePageData, { HOME_KEYS } from '../../../hooks/useHomePageData';
import styles from "./Collections.module.sass";
import Icon from "../../../components/Icon";

const Collections = ({ title }) => {

  const { data: collections, loading } = useHomePageData(HOME_KEYS.COLLECTIONS);

  if (loading) return <LoaderCircle className='loading-circle' />;

  return (
    <div className={cn("section-bg", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>{title}</h3>
          <div className={styles.inner}>
            <Slider className='collection-slider' {...settings}>
              {collections?.map((x, index) => (
                <CollectionCard
                  key={index}
                  item={x}
                  link={`${NAVIGATE_ROUTES.COLLECTION_VIEW}/${x.id}`}
                  count={x.nftCount}
                />
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

const settings = {
  infinite: false,
  speed: 500,
  slidesToShow: 3,
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
      breakpoint: 1023,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default Collections;
