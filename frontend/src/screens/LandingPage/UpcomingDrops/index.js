import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import cn from "classnames";
import API_ROUTES, { PAGINATION } from "../../../config/API_ROUTES";
import styles from "./UpcomingDrops.module.sass";
import gstyles from "../LandingPage.module.sass";

import Icon from "../../../components/Icon";
import Notice from "../../../components/Notice";
import API from "../../../services/API";
// import { backendUrl } from "../../../utils/helpers";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
    <button {...props}>{children}</button>
);


const UpcomingDrops = ({ className }) => {

    const [items, setItems] = useState([])
    const [unmounted, setUnmounted] = useState(false)

    const settings = {
        infinite: true,
        speed: 500,
        autoplay: true,
        swipe: true,
        swipeToSlide: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: items?.length > 1 ? 1 : 0,
        adaptiveHeight: true,
        dots: true,
        dotsClass: styles.dots,
        fade: true,
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
                    centerPadding: "30px",
                    centerMode: true,
                    initialSlide: items?.length > 1 ? 1 : 0,
                    fade: false
                }
            }
        ]
    };


    useEffect(() => {

        const fetchDrops = async () => {

            const resp = await API.init(API_ROUTES.UPCOMING_DROPS).getAll(`?${PAGINATION.LIMIT}=100`)
            if (!unmounted && resp.data && !resp.error)
                setItems(resp.data)
        }

        fetchDrops();

        return () => {

            setUnmounted(true)
        }
    }, [])

    if (!items?.length)
        return <Notice message="No upcoming drops found!" />

    return (
        <div className={cn(styles.section, className)}>
            <Slider className="caurosel-slider" {...settings}>
                {items?.map((x, index) => {

                    return (
                        <div className={styles.slide} key={index}>
                            <div className={styles.tag_wrapper}>
                                <div className={styles.tag}>
                                    <Icon size="18" name="calender" />
                                    <span>Upcoming Drop</span>
                                </div>
                            </div>
                            <img src={x.image || "/images/content/cover-1.png"} className={styles.slide_image} />
                            <div className={cn(styles.info, gstyles.bg_matic)}>
                                <div className={styles.details}>
                                    <span>{x.title}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Slider>
        </div>
    )
}

export default UpcomingDrops;
