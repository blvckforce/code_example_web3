import React, { useState } from "react";
import cn from "classnames";
import styles from "./Features.module.sass";
import gstyles from "../LandingPage.module.sass";

const Features = ({ className, title }) => {

    const [items, setItems] = useState([
        { title: 'Broker your NFT', description: 'Brokers can use referral links in order to help sell your NFT for a fee!', image: '/images/content/landing/nft-staking.png' },
        { title: 'Multi-currency', description: 'SwappNFT supports multi-currencies for your preference.', image: '/images/content/landing/nft-exchange.png' },
        { title: 'Agents', description: 'SwappNFT supports agents who can help NFT artists manage and sell their work.', image: '/images/content/landing/nft-token.png' },
        { title: 'Multi-chain', description: 'SwappNFT support Ethereum, BSC, Cronos, and Polygon.', image: '/images/content/landing/nft-wallet.png' }
    ])

    return (
        <div className={cn("section", styles.section, className)}>
            <div className="container">
                <h2 className={cn("h2", styles.title)}>{title}</h2>
                <div className={styles.boxes}>
                    {items?.map((x, index) => (
                        <div className={styles.box} key={index}>
                            <img src={x.image} />
                            <div className={styles.feature}>
                                <h4 className="h4">{x.title}</h4>
                                <p>{x.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Features;
