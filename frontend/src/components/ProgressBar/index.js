import React from "react";
import styles from "./ProgressBar.module.sass";

const ProgressBar = ({ completed, bgcolor }) => {
    bgcolor = bgcolor ? bgcolor : (completed < 40 ? 'yellow' : completed == 100 ? 'green' : 'blue');

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: bgcolor,
        borderRadius: 'inherit',
        textAlign: 'right'
    }

    return (
        <div className={styles.container}>
            <div style={fillerStyles}>
                <span className={styles.label}>{`${completed}%`}</span>
            </div>
        </div>
    );
};

export default ProgressBar;
