import React, { useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import useHomePageData, { HOME_KEYS } from '../../hooks/useHomePageData';
import Card from "../Card";
import SlickArrow from "../SlickArrow";
import styles from "./HotBid.module.sass";
import Icon from "../Icon";
import LoaderCircle from "../LoaderCircle";

const HotBid = ({ classSection, title, mode }) => {

  const { data: bids, loading } = useHomePageData(HOME_KEYS.AUCTIONS);

  const [visibleMenu, setVisibleMenu] = useState(false);
  const [currentItem, setCurrentItem] = useState();

  const toggleMenu = (evt, itemIndex) => {
    evt.preventDefault();
    setCurrentItem(itemIndex);
    return setVisibleMenu(!visibleMenu);
  };

  if (loading) return <LoaderCircle className='loading-circle' />;

  if (!bids.length) return null;

  return (
    <div className={cn(classSection, styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>{title}</h3>
          <div className={styles.inner}>
            <Slider className='bid-slider' {...settings}>
              {bids.map((item, index) => (
                <Card
                  key={index} className={styles.card} item={item} mode={mode}
                  visibleMenu={visibleMenu && currentItem === index}
                  toggleMenu={(evt) => toggleMenu(evt, index)}

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
  slidesToShow: 4,
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
      breakpoint: 1300,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 930,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        infinite: true,
      },
    },
  ],
};

export default HotBid;
