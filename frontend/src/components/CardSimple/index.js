import { round, toLower } from 'lodash-es';
import React, {useState} from "react";
import styles from "./CardSimple.module.sass";
import cn from "classnames";
import Image from "../Image";
import {Link} from "react-router-dom";
import NAVIGATE_ROUTES from "../../config/routes";
import TimeLeft from "../TimeLeft";
import moment from "moment";
import Icon from "../Icon";
import ContextMenu from "../Overlay/ContextMenu";
import OutsideClickHandler from "react-outside-click-handler";
import SourceContainer from "../SourceContainer";


export const CardSimple = ({
    className,item,mode,
    // visibleMenu=false,
    // toggleMenu,
}) =>{
    const bidMode = mode === "bid" || item?.type === "bid";
    const itemLikes = parseInt(item?.total_likes || 0);
    const [heartIsSet, setHeartIsSet] = useState(false);
    const [totalLikes, setTotalLikes] = useState(isNaN(itemLikes) ? 0 : itemLikes);
    const [visibleMenu, setVisibleMenu] = useState(false);

    if(!item)return(<></>)

    const onShareClick = () => {
        console.log('Shared Click')
    };

    const onReportClick = () => {
        console.log('Report Click')
    };

    const onHeartClick = () => {
        console.log('Report Click')
        setHeartIsSet(!heartIsSet)
    };

    const renderUnderBlock = () => {

        const wrapper = (child) => (
            <div className={styles.foot}>
                {child}
            </div>
        );

        if (!item?.is_minted || !item?.on_sale) {
            return;
        }

        if (item?.type==='bid') {
            return wrapper(item?.highest_bit && <div className={styles.highestBit}>
                    <span>Highest bid:</span>
                    <div className={styles.priceTitle}>
                                <span className={cn(
                                    "currency", "n2", "small", "light",
                                    { "eth": toLower(item.currency) === "ether" || toLower(item.currency) === "eth" },
                                    { "weth": toLower(item.currency) === "weth" },
                                )}>
                                     {` ${round(+item.highest_bit, 6)}`}
                                </span>
                    </div>
                </div>
            );
        }

        if ((+(item.start_date ?? 0) + (item.end_date ?? 0) * 1000) <= Date.now()) {
            return wrapper(
                <span>The Auction Has Ended</span>,
            );
        }

        if (item.start_date && item.end_date) {
            return wrapper(
                <TimeLeft
                    time={moment(+item.start_date + item.end_date * 1000).format("lll")}
                    preTag={"Ends at"}
                    className={styles.time}
                    showIcon
                />,
            );
        }

        return null;
    };

    const renderCard = () => {

        const name = item?.account?.name ?? item.account?.address ?? ''

        const child = (
            <>
                <div className={styles.info}>
                    <div className={cn(styles.names)}>
                        <div className={styles.owner}>
                            {!!name && <p className={styles.fullName}>{name}</p>}
                            {!!name && item?.account?.verified &&
                            <span className={styles.gap}>
                                <Image src='/images/content/verified_account_primary.png' />
                            </span>
                            }
                        </div>
                        <div className={styles.priceTitle}>
                            {bidMode ? "Minimum bid" : "Price"}
                        </div>
                    </div>
                    <div className={cn(styles.descFooter)}>
                        <div className={styles.nftName}>
                            {item.name}
                        </div>
                        <div className={styles.priceTitle}>
                            <span className={cn(
                                "currency", "n2", "small", "light",
                                { "eth": toLower(item.currency) === "ether" || toLower(item.currency) === "eth" },
                                { "weth": toLower(item.currency) === "weth" },
                            )}>
                                 {` ${round(+item.price, 6)}`}
                            </span>
                        </div>
                    </div>
                </div>
                {renderUnderBlock()}
            </>
        );
        return <Link className={styles.link} to={`${NAVIGATE_ROUTES.ITEM_PAGE}/${item.id || item.token_id}`}>
            {child}
        </Link>;

    };


    return (
        <>
            <div className={cn(styles.card, className)}>
                    <>
                        <div className={cn("row", styles.header)}>
                            <button
                                className={cn("button-no-outline")}
                                onClick={(evt) => setVisibleMenu(true)}
                            >
                                <Icon name='more' size='20' />
                            </button>

                            <ContextMenu className={cn(styles.menu)} visibleMenu={visibleMenu}>
                                <OutsideClickHandler
                                    onOutsideClick={() => setVisibleMenu(false)}
                                >{[
                                    { label: "Report", icon: "shield_fail" },
                                    { label: "Share", icon: "share1" },
                                ].map((item) => (

                                    <div className={cn("row")} key={item.label}>
                                        <button
                                            className={cn("button-no-outline", "button-hover")}
                                            onClick={
                                                item?.label === "Report"
                                                    ? onReportClick
                                                    : onShareClick
                                            }
                                        >
                                            <Icon name={item.icon} size={28} forceSprite={true} />
                                            <span>{item.label}</span>
                                        </button>
                                    </div>

                                ))}
                                </OutsideClickHandler>
                            </ContextMenu>
                            <div className={cn("row", styles.heart)}>
                                <button
                                    className={cn("button-no-outline", styles.favorite, {
                                        [styles.active]: heartIsSet,
                                    })}
                                    onClick={onHeartClick}
                                >
                                    <Icon name="heart" size="20" />
                                </button>
                                <div className={styles.label}>{!heartIsSet ? totalLikes : totalLikes+1}</div>
                            </div>
                        </div>
                    </>
                <div className={styles.preview}>
                    <SourceContainer url={item.image} alt={item.name} />
                </div>
                {renderCard()}
            </div>
        </>
    );
}
