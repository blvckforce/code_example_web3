import cn from "classnames";
import Slider from "react-slick";
import useHomePageData, { HOME_KEYS } from '../../hooks/useHomePageData';
import SlickArrow from "../SlickArrow";
import styles from "./HotNFTs.module.sass";
import Icon from "../Icon";
import Card from "../Card";
import LoaderCircle from "../LoaderCircle";

const HotNFTs = ({ classSection, title, mode }) => {

  const { data: nfts, loading } = useHomePageData(HOME_KEYS.HOT_NFTS);

  if (loading) return <LoaderCircle className='loading-circle' />;

  if (!nfts?.length) {
    return null;
  }

  return (
    <div className={cn(classSection, styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>{title}</h3>
          <div className={styles.inner}>
            <Slider className='bid-slider' {...settings}>
              {nfts?.map((item, index) => (
                <Card
                  key={item.id}
                  className={styles.card}
                  item={item}
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
      },
    },
  ],
};

export default HotNFTs;
