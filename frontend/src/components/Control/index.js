import React from "react";
import cn from "classnames";
import { Link, useHistory } from "react-router-dom";
import styles from "./Control.module.sass";
import Icon from "../Icon";

const Control = ({ className, item, backLinkTitle = "Go back" }) => {
    const history = useHistory()

    return (
        <div className={cn(styles.control, className)}>
            <div className={cn("container", styles.container)}>
                <button
                    className={cn("button-stroke button-small", styles.button)}
                    onClick={() => history.goBack()}
                >
                    <Icon name="arrow" size="24" />
                    <span>{backLinkTitle}</span>
                </button>
                <div className={styles.breadcrumbs}>
                    {item.map((x, index) => (
                        <div className={styles.item} key={index}>
                            {x.url ? (
                                <Link className={styles.link} to={x.url}>
                                    {x.title}
                                </Link>
                            ) : (
                                x.title
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Control;
