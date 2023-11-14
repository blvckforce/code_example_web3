import cn from 'classnames';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import NAVIGATE_ROUTES from '../../config/routes';
import { ITEM_TYPES } from '../Item/Components/PutOnSaleForm';
import styles from './Discover/Discover.module.sass';
import Hero from "./HeroGrid";
// import Popular from "./Popular";
import HotBid from "../../components/HotBid";
import HotNFT from "../../components/HotNFTs";
import UpcomingDrop from "../../components/UpcomingDrop";
import Collections from "./Collections";
// import Discover from "./Discover";
// import TopCollections from "./TopCollection";

const Home = () => {
  return (
    <>
      <SEO title={'Explore'} url={window.location.href} />
      <Hero />
      {/*<TopCollections />*/}
      {/*<Popular />*/}
      <HotBid classSection='section' title='Live auctions ⏳' />
      <HotNFT classSection='section' title='Hot NFTs 🔥' mode={ITEM_TYPES.BID} />
      <Collections title='Best collections 💸' />
      {/*<Discover title="Explore" />*/}

      <div className={'container'} style={{ textAlign: 'center' }}>
        <Link to={NAVIGATE_ROUTES.EXPLORE} className={cn("button-stroke button-small button-full", styles.button)}>
          <span>To Explore</span>
        </Link>
      </div>
      <UpcomingDrop />
    </>
  );
};

export default Home;
