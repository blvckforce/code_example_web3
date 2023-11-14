import cn from "classnames";
import Slider from "react-slick";
import useHomePageData, { HOME_KEYS } from '../../hooks/useHomePageData';
import Image from "../Image";
import { backendUrl } from "../../utils/helpers";
import LoaderCircle from "../LoaderCircle";
import SlickArrow from "../SlickArrow";
import styles from "./UpcomingDrop.module.sass";
import Icon from "../../components/Icon";

const UpcomingDrop = () => {

  const { data :upcoming, loading } = useHomePageData(HOME_KEYS.UPCOMING_DROP);

  if (loading) return <LoaderCircle className='loading-circle' />;

  if (!upcoming?.length) {
    return null;
  }

  return (
    <div className={cn(styles.section)}>
      <div className={cn("container", styles.wrapper)}>
        <Slider className='bid-slider' {...settings}>
          {upcoming?.map((item) => (
            <div key={item.id} className={cn(styles.itemWrapper)}>
              <div>
                <Image
                  className={cn(styles.image)}
                  src={backendUrl(item?.image)}
                />
                <div className={cn(styles.upcomingDrop)}>
                  Upcoming Drop
                </div>
                <div className={cn(styles.name)}>{item?.title}</div>

              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const settings = {
  adaptiveHeight: true,
  // arrows: false,
  dots: true,
  infinite: true,
  autoplay: true,
  speed: 500,
  slidesToShow: 1,
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
};

export default UpcomingDrop;
