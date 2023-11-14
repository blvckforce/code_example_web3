import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Dropdown.module.sass";
import Icon from "../Icon";

const Dropdown = ({ className, value, setValue, value_index, label_index, options, defaultLabel }) => {
    const [visible, setVisible] = useState(false);
    const [label, setLabel] = useState(value_index ? defaultLabel : value);

    const handleClick = (value, index = null) => {

        setValue(value);

        if (index != null && value_index) {

            setLabel(options[index][label_index])
        } else setLabel(value)
        setVisible(false);
    };

    return (
        <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
            <div
                className={cn(styles.dropdown, className, { [styles.active]: visible })}
            >
                <div className={styles.head} onClick={() => setVisible(!visible)}>
                    <div className={styles.selection}>{label}</div>
                    <div className={styles.arrow}>
                        <Icon name="arrow-bottom" size="10" />
                    </div>
                </div>
                <div className={styles.body}>
                    {
                        value_index ?
                            options.map((x, index) => {
                                if (x[value_index] == value && !label)
                                    setLabel(x[label_index])
                                return (
                                    <div
                                        className={cn(styles.option, {
                                            [styles.selectioned]: x[value_index] === value,
                                        })}
                                        onClick={() => handleClick(x[value_index], index)}
                                        key={index}
                                    >
                                        {x[label_index]}
                                    </div>
                                )


                            })
                            :
                            options.map((x, index) => (
                                <div
                                    className={cn(styles.option, {
                                        [styles.selectioned]: x === value,
                                    })}
                                    onClick={() => handleClick(x)}
                                    key={index}
                                >
                                    {x}
                                </div>
                            ))
                    }
                </div>
            </div>
        </OutsideClickHandler>
    );
};

export default Dropdown;
