import cn from "classnames";
import SEO from '../../components/SEO';
import NAVIGATE_ROUTES from "../../config/routes";
import { useProfile } from '../../contexts/profile.context';
import styles from "./LandingPage.module.sass";
import Hero from "./Hero";
import Subscribe from "./Subscribe";
import ImageBox from "./ImageBox";
import { Link } from "react-router-dom";
import Features from "./Features";
import toast from "react-hot-toast";

const Jumbotron = ({ title, subtitle, className, children }) => {

  return (
    <div className={cn(styles.jumbotron, className)}>
      <div className='container'>
        {title && <h3 className='h3'>
          {title}
        </h3>
        }
        {subtitle && <p className={cn("p", styles.subtitle)}>
          {subtitle}
        </p>
        }
        {children}
      </div>
    </div>
  );
};

const LandingPage = () => {

  const { profile } = useProfile();

  const onAgentRegistrationLinkClick = (e) => {
    if(profile?.account?.artist) {
      e.preventDefault()
      toast.error('You are already an agent')
    }
  };

  return (
    <div className={styles.landing}>
      <SEO />
      <Hero />
      <Subscribe />
      <ImageBox
        title={<span>Become an exclusive creator on <span
          className='rainbow-text rainbow-text-light'>SWAPP NFT</span></span>}
        description='Fill out the author verification form and become one of the first artists who will be able to create NFTs on our platform after its opening!'
        image='/images/content/landing/register_artist.png'
        backgroundImage='/images/content/landing/background-1.png'
        actions={
          <button
            className={cn("button", styles.cta)}
            onClick={() => toast.error("Coming soon...")}
          >
            Apply as an Artist
          </button>
        }
        className={styles.transparent}

      />
      <ImageBox
        title={<span>Become a SwappNFT agent <span className='rainbow-text'>and earn from the</span> <span
          className='rainbow-text'>sales of artists</span></span>}
        description='We are reinventing the NFT marketplace by enabling agents to help artists with the NFT creation and sales process.'
        image='/images/content/landing/register_agent.png'
        backgroundImage='/images/content/landing/colors.png'
        boxClassName={styles.box_full_mobile_cover}
        actions={<Link to={NAVIGATE_ROUTES.SIGN_UP_PAGE} onClick={onAgentRegistrationLinkClick}
                       className={cn("button", styles.cta)}>Create Agent
          Account</Link>}
      />

      <Features title='Unique Features' />

      <Jumbotron
        title='Enabling Creators'
        subtitle='SwappNFT is all about enabling creators and that is why we included a multi-tiered fee model which allows artists to have several parties help them sell their NFTs as well as collaborating with other artists for increased exposure.'
        clip={false}
        className={cn(styles.section, styles.small, 'mobile-hide')}
      />


      <ImageBox
        title={<span>Create NFT Drops Directly on SwappNFT</span>}
        description='Our platform allows artists to create NFT drops directly on the platform without having to create a website, code smart contracts, and get into the technical details of launching NFTs.'
        image='/images/content/landing/auction.png'
        backgroundImage='/images/content/landing/colors.png'
        boxClassName={styles.box_full_mobile}
        clip={false}
        className={styles.transparent}
      />

      <ImageBox
        title={<span>Stake the tokens you earned</span>}
        description='The SwappNFT platform will have direct integrations with staking pools that can be used in order to earn a passive income on the creators NFT earnings, without having to go and find different DeFi platforms to do so.'
        image='/images/content/landing/nft-pack.png'
        backgroundImage='/images/content/landing/colors.png'
        boxClassName={styles.box_full_mobile}
        mediaPosition='left'
        clip={false}
        className={styles.transparent}
      />

      <ImageBox
        title={<span>Broker</span>}
        description='The Swapp platform allows users to stake their Swapp tokens, locking them up for a period of time, in order to earn interest in the form of Swapp rewards.'
        image='/images/content/landing/money.png'
        backgroundImage='/images/content/landing/colors.png'
        boxClassName={styles.box_full_mobile}
        clip={false}
        className={styles.transparent}
      />

      <Jumbotron
        title='Become a Creator in the SwappNFT Ecosystem'
        subtitle='The first 100 creators on the platform will get priveleged whitelist access to NFT artist drops.'
      >
        <button
          className={cn("button", styles.actions, styles.cta)}
          onClick={() => toast.error('Coming soon...')}
        >
          Create Artist Account
        </button>
      </Jumbotron>


      <Jumbotron
        className={cn(styles.section, styles.ellipsis, styles.small)}
      >
        <img src='/images/content/landing/ellipses.png' />
      </Jumbotron>


    </div>
  );
};

export default LandingPage;
