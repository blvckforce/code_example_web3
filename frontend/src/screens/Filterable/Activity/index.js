import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Activity.module.sass";
import LoaderCircle from "../../../components/LoaderCircle";
import Notice from "../../../components/Notice";
import Icon from "../../../components/Icon";

const Activity = ({ className, filters, onResultUpdated }) => {

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    const list = [
        {
            id: "#4450",
            title: "Amazing digital art",
            price: "2.45",
            image: "/images/content/card-pic-1.jpg",
            type: "sales",
            from: {
                name: "NTF Punk",
            },
            to: {
                name: "NFT User"
            }
        },
        {
            id: "#4450",
            title: "Amazing digital art",
            price: "2.45",
            image: "/images/content/card-pic-1.jpg",
            type: "sales",
            from: {
                name: "NTF Punk",
            },
            to: {
                name: "NFT User"
            }
        },
        {
            id: "#4450",
            title: "Amazing digital art",
            price: "2.45",
            image: "/images/content/card-pic-1.jpg",
            type: "sales",
            from: {
                name: "NTF Punk",
            },
            to: {
                name: "NFT User"
            }
        },
        {
            id: "#4450",
            title: "Amazing digital art",
            price: "2.45",
            image: "/images/content/card-pic-1.jpg",
            type: "sales",
            from: {
                name: "NTF Punk",
            },
            to: {
                name: "NFT User"
            }
        },
        {
            id: "#4450",
            title: "Amazing digital art",
            price: "2.45",
            image: "/images/content/card-pic-1.jpg",
            type: "sales",
            from: {
                name: "NTF Punk",
            },
            to: {
                name: "NFT User"
            }
        },
    ]
    useEffect(() => {
        fetch("https://api.example.com/items")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setItems(result);
                },
                // dont swallow exceptions from actual bugs in components.
                (error) => {
                    setIsLoaded(true);
                    //setError(error);
                    setItems(list);
                    onResultUpdated(list.length)
                }
            )
    }, [])

    if (error) {
        return <Notice message={error.message} type="error" />;
    } else if (!isLoaded) {
        return <LoaderCircle className={styles.loader} />;
    } else {
        return (
            <>
                <div className={cn(className, styles["table-responsive"])}>
                    <table>
                        <caption>
                            <Icon name="swap" size="24" />
                            Trending History
                        </caption>
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Item</th>
                                <th>Unit Price</th>
                                <th>From</th>
                                <th>To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items?.map((x, index) => (
                                <tr key={index}>
                                    <td>
                                        <Icon className={styles.event} name={x.icon || "buy"} />
                                        <span>
                                            {x.type}
                                        </span>
                                    </td>
                                    <td className={styles.item}>
                                        <img src={x.image} />
                                        <div className={styles.details}>
                                            <span>{x.title}</span>
                                            <span>{x.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="currency no-text">{x.price}</span>
                                    </td>
                                    <td>
                                        {x.from.name}
                                    </td>
                                    <td>
                                        {x.to.name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </>
        )
    }
};

export default Activity;
