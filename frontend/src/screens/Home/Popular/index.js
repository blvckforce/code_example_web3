import React, { useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import styles from "./Popular.module.sass";
import Add from "./Add";
import Icon from "../../../components/Icon";
import Dropdown from "../../../components/Dropdown";
import DropdownEmpty from "../../../components/DropdownEmpty";

const items = [
    {
        name: "Tural Bayev",
        sign: "/images/content/cup.svg",
        number: "1",
        url: "/profile",
        color: "#3772FF",
        avatar: "/images/sellers/seller1.png",
        reward: "/images/content/reward-1.svg",
        price: "<span>2.456</span>",
    },
    {
        name: "Joseph Karns",
        sign: "/images/content/donut.svg",
        number: "2",
        url: "/profile",
        color: "#9757D7",
        avatar: "/images/sellers/seller2.png",
        reward: "/images/content/reward-1.svg",
        price: "<span>2.456</span>",
    },
    {
        name: "Dmitriy Azarenko",
        sign: "/images/content/lightning.svg",
        number: "3",
        url: "/profile",
        color: "#45B26B",
        avatar: "/images/sellers/seller3.png",
        reward: "/images/content/reward-1.svg",
        price: "<span>2.456</span>",
    },
    {
        name: "Jonathan B. Rosen",
        sign: "/images/content/donut.svg",
        number: "4",
        url: "/profile",
        color: "#23262F",
        avatar: "/images/sellers/seller4.png",
        reward: "/images/content/reward-1.svg",
        price: "<span>2.456</span>",
    },
    {
        name: "Elchin Bayramov",
        sign: "/images/content/donut.svg",
        number: "5",
        url: "/profile",
        color: "#777E90",
        avatar: "/images/sellers/seller5.png",
        reward: "/images/content/reward-1.svg",
        price: "<span>2.456</span>",
    },
];

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
        <button {...props}>{children}</button>
    );

const dateOptions = ["Today", "Morning", "Dinner", "Evening"];
const directionOptions = ["Sellers", "Buyers"];

const Popular = () => {
    const settings = {
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        adaptiveHeight: true,
        nextArrow: (
            <SlickArrow>
                <Icon name="arrow-next" size="14" />
            </SlickArrow>
        ),
        prevArrow: (
            <SlickArrow>
                <Icon name="arrow-prev" size="14" />
            </SlickArrow>
        ),
        responsive: [
            {
                breakpoint: 1340,
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 665,
                settings: {
                    slidesToShow: 2,
                },
            },
        ],
    };

    const [date, setDate] = useState(dateOptions[0]);
    const [direction, setDirection] = useState(directionOptions[0]);

    return (
        <div className={cn("section-bg", styles.section)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.top}>
                    <div className={styles.box}>
                        <div className={styles.stage}>Top</div>
                        <DropdownEmpty
                            className={styles.dropdown}
                            value={direction}
                            setValue={setDirection}
                            options={directionOptions}
                        />
                    </div>
                    <div className={styles.field}>
                        <div className={styles.label}>timeframe</div>
                        <Dropdown
                            className={styles.dropdown}
                            value={date}
                            setValue={setDate}
                            options={dateOptions}
                        />
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <Slider className="popular-slider" {...settings}>
                        {items?.map((x, index) => (
                            <div className={styles.slide} key={index}>
                                <div className={styles.item}>
                                    <div className={styles.head}>
                                        <div
                                            className={styles.rating}
                                            style={{ backgroundColor: x.color }}
                                        >
                                            <div className={styles.icon}>
                                                <img src={x.sign} alt="Rating" />
                                            </div>
                                            <div className={styles.number}>#{x.number}</div>
                                        </div>
                                        <div className={styles.control}>
                                            <Add className={styles.button} />
                                            <Link className={styles.button} to={x.url}>
                                                <Icon name="arrow-expand" size="24" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className={styles.body}>
                                        <div className={styles.avatar}>
                                            <img src={x.avatar} alt="Avatar" />
                                            <div className={styles.reward}>
                                                <img src={x.reward} alt="Reward" />
                                            </div>
                                        </div>
                                        <div className={styles.name}>{x.name}</div>
                                        <div
                                            className={cn("currency", "small", styles.price)}
                                            dangerouslySetInnerHTML={{ __html: x.price }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Popular;
