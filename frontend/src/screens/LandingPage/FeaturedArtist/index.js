import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import cn from "classnames";
import API_ROUTES, { PAGINATION } from "../../../config/API_ROUTES";
import styles from "./FeaturedArtist.module.sass";
import gstyles from "../LandingPage.module.sass";

import Icon from "../../../components/Icon";
import Notice from "../../../components/Notice";
import { parseAccount } from "../../../utils/wallet";
import API from "../../../services/API";
//import { profiles } from "../../../mocks/Mocks";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
    <button {...props}>{children}</button>
);


const FeaturedArtist = ({ className, children }) => {

    const [items, setItems] = useState([])
    const [unmounted, setUnmounted] = useState(false)

    const settings = {
        infinite: false,
        speed: 500,
        autoplay: false,
        swipe: true,
        swipeToSlide: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
        adaptiveHeight: true,
        dots: true,
        dotsClass: styles.dots,
        nextArrow: (
            <SlickArrow>
                <Icon name="arrow-down" size="20" />
            </SlickArrow>
        ),
        prevArrow: (
            <SlickArrow>
                <Icon name="arrow-down" size="20" />
            </SlickArrow>
        ),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerPadding: "20px",
                    centerMode: true,
                    initialSlide: 2
                }
            }
        ]
    };


    useEffect(() => {

        const fetchFeatured = async () => {

            //setItems([profiles[0].account, profiles[0].account, profiles[0].account, profiles[0].account])

            const resp = await API.init(API_ROUTES.ARTISTS).getAll(`?${PAGINATION.LIMIT}=100`)
            if (!unmounted && resp.data && !resp.error)
                setItems(resp.data)
        }

        fetchFeatured();

        return () => {

            setUnmounted(true)
        }
    }, [])

    if (!items?.length)
        return <Notice message="No artist found!" />

    return (
        <div className={cn(styles.section, className)}>
            {children}
            <Slider className="caurosel-slider" {...settings}>
                {items?.map((x, index) => {
                    x.account = parseAccount(x.account);

                    return (
                        <div className={styles.slide} key={index}>
                            <div className={styles.tag_wrapper}>
                                <div className={styles.tag}>
                                    <Icon size="18" name="calender" />
                                    <span>Upcoming Drop</span>
                                </div>
                            </div>
                            <img src={x.account?.background || "/images/content/cover-1.png"} className={styles.slide_image} />
                            <div className={cn(styles.info, gstyles.bg_matic)}>
                                <img src={x.account?.avatar || "/images/content/avatar.png"} className={styles.avatar} />
                                <div className={styles.footer}>
                                    <div className={styles.details}>
                                        <span className="ellipsis">{`${x.first_name || x.account?.name} ${x.last_name}`}</span>
                                        <span className="ellipsis">{x.account?.twitter}</span>
                                    </div>
                                    <div>
                                        <Icon size="18" name="time-circle" />
                                        <span>3d 21h 46m 5s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Slider>
        </div>
    )
}

export default FeaturedArtist;
