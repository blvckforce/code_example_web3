import React, { useState } from "react";
import cn from "classnames";
import styles from "./Accordion.module.sass";
import Icon from "../Icon";

const Accordion = ({ className, title, visible, setVisible, children }) => {
    const [show, setShow] = useState(visible);

    const hide = () => {
        if (setVisible)
            setVisible()
        else
            setShow(!show)
    }

    return (

        <div
            className={cn(styles.accordion, className, { [styles.active]: visible ?? show })}
        >
            <div className={styles.head} onClick={() => hide(!show)}>
                <div className={styles.title}>{title}</div>
                <div className={styles.arrow}>
                    <Icon name="arrow-bottom" size="10" />
                </div>
            </div>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};

export default Accordion;
