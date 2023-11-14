import React, { useState } from "react";
import cn from "classnames";
import styles from "./TopCollection.module.sass";
import DropdownEmpty from "../../../components/DropdownEmpty";
import Image from "../../../components/Image";

// FIXME
const topCollections = [
    {
        id:1,
        icon: "/images/content/avatar12.png",
        name: "MekaVerssssssssssssssssssssssssssse",
        price: '$83,874,986'
    },
    {
        id:2,
        icon: "/images/content/avatar13.png",
        name: "Cryptoadz",
        price: '$20,874,986'
    },
    {
        id:3,
        icon: "/images/content/avatar-8.jpg",
        name: "MutantCats",
        price: '$19,874,986'
    },
    {
        id:4,
        icon: "/images/content/avatar12.png",
        name: "MekaVerse",
        price: '$83,874,986'
    },
    {
        id:5,
        icon: "/images/content/avatar13.png",
        name: "Cryptoadz",
        price: '$20,874,986'
    },
    {
        id:6,
        icon: "/images/content/avatar-8.jpg",
        name: "MutantCats",
        price: '$19,874,986'
    },
    {
        id:7,
        icon: "/images/content/avatar12.png",
        name: "MekaVerse",
        price: '$83,874,986'
    },
    {
        id:8,
        icon: "/images/content/avatar13.png",
        name: "Cryptoadz",
        price: '$20,874,986'
    },
    {
        id:9,
        icon: "/images/content/avatar-8.jpg",
        name: "MutantCats",
        price: '$19,874,986'
    },
    {
        id:10,
        icon: "/images/content/avatar12.png",
        name: "MekaVerse",
        price: '$83,874,986'
    },
    {
        id:11,
        icon: "/images/content/avatar13.png",
        name: "Cryptoadz",
        price: '$20,874,986'
    },
    {
        id:12,
        icon: "/images/content/avatar-8.jpg",
        name: "MutantCats",
        price: '$19,874,986'
    },
]

const TopCollections = () => {
    const directionOptions = ["5 days", "10 days"];
    const [direction, setDirection] = useState(directionOptions[0]);

    return (
        <div className={cn("section-bg", styles.section)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.top}>
                    <div className={styles.box}>
                        <h1 className={styles.stage}>Top collections in</h1>
                        <DropdownEmpty
                            className={styles.dropdown}
                            value={direction}
                            setValue={setDirection}
                            options={directionOptions}
                        />
                    </div>
                    <div className={styles.field}>
                        <button className={cn("button-outline")}>See more</button>
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <div className={styles.list}>
                        {topCollections.map((item, index) => (
                            <button className={cn(styles.btn, styles.row)} key={index}>
                                <div className={cn("row", styles.span)}>
                                    <span>{item.id}</span>
                                    <Image className={styles.icon} src={item.icon} />
                                    <div className={styles.nameWrapper}>
                                        <h5 className={styles.name}>{item.name}</h5>
                                        <span className={styles.price}>{item.price}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopCollections;
