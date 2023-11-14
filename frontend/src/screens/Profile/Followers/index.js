import React from "react";
import cn from "classnames";
import NAVIGATE_ROUTES from "../../../config/routes";
import styles from "./Followers.module.sass";
import Notice from "../../../components/Notice";
import { parseAccount } from "../../../utils/wallet";
import { Link } from "react-router-dom";

/*
* User followers
*/
const Followers = ({ className, items, mode = 'following' }) => {
    const entity = mode == 'following' ? 'follower' : 'account';

    if (!Array.isArray(items) || !items?.length)
        return <Notice message="Empty" />

    return (
        <div className={cn(styles.followers, className)}>
            <div className={styles.list}>
                {items?.map((item, index) => {

                    let x = parseAccount(item[entity]);

                    if (x)
                        return (
                            <div className={styles.item} key={index}>
                                <div className={styles.follower}>
                                    <div className={styles.avatar}>
                                        <img src={x?.avatar} alt="Avatar" />
                                    </div>
                                    <div className={styles.details}>
                                        <div className={styles.title}>{x.name}</div>
                                        <div className={styles.counter}>{x.address}</div>
                                        <Link
                                            className={cn(
                                                "button-stroke button-small",
                                                styles.button
                                            )}
                                            to={`${NAVIGATE_ROUTES.PROFILE}/${x.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                                <div className={styles.wrap}>
                                    <div className={styles.gallery}>
                                        {x.gallery && x.gallery.map((x, index) => (
                                            <div className={styles.preview} key={index}>
                                                <img src={x} alt="Follower" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                }
                )}
            </div>
        </div>
    );
};

export default Followers;
