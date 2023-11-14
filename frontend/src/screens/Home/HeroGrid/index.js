import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import SlickArrow from "../../../components/SlickArrow";
import NAVIGATE_ROUTES from "../../../config/routes";
import useHomePageData, { HOME_KEYS } from '../../../hooks/useHomePageData';
import { backendUrl } from '../../../utils/helpers';

import styles from "./HeroGrid.module.sass";
import Icon from "../../../components/Icon";
import Modal from "../../../components/Modal";
import Notice from "../../../components/Notice";
import LoaderCircle from "../../../components/LoaderCircle";
// import { backendUrl } from '../../../utils/helpers'

const Hero = () => {

  const { data: artists, loading } = useHomePageData(HOME_KEYS.ARTISTS);

  const [visibleModalFeatured, setVisibleModalFeatured] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);


  const GetFeatured = () => (
    <>
      <button className={styles.get_featured} onClick={() => setVisibleModalFeatured(true)}>Get featured on the
        homepage
      </button>
      <Modal
        visible={visibleModalFeatured}
        onClose={() => setVisibleModalFeatured(false)}
        containerClassName={styles.feature_modal}
      >
        <h2 className={styles.title}>Get featured on the homepage</h2>
        <ol>
          <li>Create your NFT on SWAPPNFT</li>
          <li>Post a link to your NFT on Twitter or Instagram</li>
          <li>Include @SwappNFT and #swappnft in your post</li>
          <li>We will periodically review these NFTs and select one to feature</li>
        </ol>
        <p>Be sure to follow us on Twitter and Instagram to receive updates on our featured NFTs</p>

        <div className={styles.actions}>
          <a href='https://twitter.com/SwappNFT' target='_blank' className={cn("button btn-primay")}
             rel='noreferrer'>Twitter</a>
          <a href='https://www.instagram.com/swappnft' target='_blank' className={cn("button btn-primay")}
             rel='noreferrer'>Instagram</a>
        </div>
      </Modal>
    </>
  );

  useEffect(() => {
    if (!loading) {
      if (!artists.length) {
        setError("No featured found");
        return;
      }
      setError("");

      const groupedItems = [];
      artists.forEach((item, index) => {
        const groupNumber = parseInt(`${index / 5}`, 10);
        if (!groupedItems[groupNumber]) {
          groupedItems[groupNumber] = [];
        }
        groupedItems[groupNumber].push(item);
      });

      setItems(groupedItems);
    }

  }, [artists, loading]);

  if (loading) {
    return <LoaderCircle className='loading-circle' />;
  }

  if (error || (!loading && !items.length)) {
    return <Notice message={error} type='Info' action={<GetFeatured />} />;
  }

  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <h3 className={cn("h3", styles.main_title)}>Featured Artists</h3>
          <Slider className='bid-slider' {...settings} >
            {items?.map((groupItems, index) => (
              <div key={index} className={styles.wrapper}>
                <div className={styles.row}>
                  <div className={styles.main}>
                    {groupItems?.slice(0, 1).map((profile, index) => (
                      <Profile profile={profile.account} main key={index} />
                    ))}
                  </div>
                  <div className={styles.gallery}>
                    {groupItems?.slice(1, 5).map((profile, index) => (
                      <Profile profile={profile.account} key={index} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      <Modal
        visible={visibleModalFeatured}
        onClose={() => setVisibleModalFeatured(false)}
        containerClassName={styles.feature_modal}
      >
        <h2 className={styles.title}>Get featured on the homepage</h2>
        <ol>
          <li>Create your NFT on SWAPPNFT</li>
          <li>Post a link to your NFT on Twitter or Instagram</li>
          <li>Include @SwappNFT and #swappnft in your post</li>
          <li>We will periodically review these NFTs and select one to feature</li>
        </ol>
        <p>Be sure to follow us on Twitter and Instagram to receive updates on our featured NFTs</p>

        <div className={styles.actions}>
          <a href='https://twitter.com/SwappNFT' target='_blank' className={cn("button btn-primay")}
             rel='noreferrer'>Twitter</a>
          <a href='https://www.instagram.com/swappnft' target='_blank' className={cn("button btn-primay")}
             rel='noreferrer'>Instagram</a>
        </div>
      </Modal>
    </>
  );
};

const Profile = ({ profile, main }) => (
  <Link to={NAVIGATE_ROUTES.PROFILE + "/" + profile?.id} className={main ? styles.mainImage : styles.column}>
    <img
      src={backendUrl(profile?.avatar?.url || profile?.avatar)}
      alt='Avatar'
    />
    <div className={styles.details}>
      <h3 className={styles.title}>{profile?.name}</h3>
    </div>
  </Link>
);

const settings = {
  adaptiveHeight: true,
  // arrows: false,
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

export default Hero;
