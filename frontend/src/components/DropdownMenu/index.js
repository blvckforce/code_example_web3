import React, { useEffect, useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./DropdownMenu.module.sass";

const DropdownMenu = ({ className, bodyClassName, headClassName, toggle, children, show = false, hide }) => {
    const [visible, setVisible] = useState(show);

    const close = () => {

        if (hide)
            hide()
        else
            setVisible(false)
    }

    useEffect(() => {

        setVisible(show)
    }, [show])

    return (
        <OutsideClickHandler onOutsideClick={close}>
            <div
                className={cn(styles.dropdown, className, { [styles.active]: visible })}
            >
                <div className={cn(headClassName, styles.head)}>
                    {toggle}
                </div>
                <div className={cn(bodyClassName, styles.body)}>
                    {children}
                </div>
            </div>
        </OutsideClickHandler>
    );
};

export default DropdownMenu;
