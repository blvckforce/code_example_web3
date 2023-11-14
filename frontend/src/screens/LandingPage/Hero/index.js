import React from "react";
import cn from "classnames";
import styles from "./Hero.module.sass"
//import FeaturedArtist from "../FeaturedArtist";
import Image from "../../../components/Image";
import gstyles from "../LandingPage.module.sass";
import UpcomingDrops from "../UpcomingDrops";
import { useHistory } from "react-router";

const Hero = () => {
    const history = useHistory();
    return (

        <div className={cn("section", styles.section)} style={{ backgroundImage: "url('/images/content/landing/background.png')" }}>
            <div className={cn('container', gstyles.jumbotron)}>
                <Image
                    className={styles.logo}
                    src="/images/logo-dark.svg"
                    srcDark="/images/logo-light.svg"
                    alt=""
                />
                <h2 className="h2">The most needed NFT Marketplace</h2>
                <p>SwappNFT is an innovative NFT market that brings together talented creators, agents, and promoters. Create your own collections, upload your works and earn!</p>
            </div>
            <UpcomingDrops />
        </div>
    )
}

export default Hero;
