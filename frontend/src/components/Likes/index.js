import React from "react";
import cn from "classnames";

import styles from "./Likes.module.sass";
import Icon from "../Icon";

const Likes = ({ onLike, totalLikes }) => {
    return (
        <div className={cn("row", styles.heart)}>
            <button
                className={cn("button-no-outline", styles.favorite)}
                onClick={onLike}
            >
                <Icon name="heart" size="22" />
        </button>
            <div className={styles.label}>{totalLikes}</div>
        </div>
    );
};

export default Likes;
