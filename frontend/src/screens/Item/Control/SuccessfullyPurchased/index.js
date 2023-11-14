import React from "react";
import cn from "classnames";
import styles from "./SuccessfullyPurchased.module.sass";
import Icon from "../../../../components/Icon";

const socials = [
    {
        title: "facebook",
        url: "https://www.facebook.com/ui8.net/",
    },
    {
        title: "twitter",
        url: "https://twitter.com/ui8",
    },
    {
        title: "instagram",
        url: "https://www.instagram.com/ui8net/",
    },
    {
        title: "pinterest",
        url: "https://www.pinterest.com/ui8m/",
    },
];

const SuccessfullyPurchased = ({className, transaction}) => {
    const transactionId = `${transaction.id.slice(0, 10)}...${transaction.id.slice(-6)}`;

    return (
        <div className={cn(className, styles.wrap)}>
            <div className={cn("h2", styles.title)}>
                Yay!{" "}
                <span role="img" aria-label="firework">
                    🎉
                </span>
            </div>
            <div className={styles.info}>
              You have successfully purchased the NFT.
            </div>
            <div className={styles.table}>
                <div className={styles.row}>
                    <div className={styles.col}>Status</div>
                    <div className={styles.col}>Transaction ID</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.col}>{transaction.status}</div>
                    <div className={styles.col}>{transactionId}</div>
                </div>
            </div>
            <div className={styles.stage}>Time to show-off</div>
            <div className={styles.socials}>
                {socials.map((x, index) => (
                    <a
                        className={styles.social}
                        href={x.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                    >
                        <Icon name={x.title} size="24"/>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SuccessfullyPurchased;
