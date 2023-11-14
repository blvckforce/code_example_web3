import cn from "classnames";
import React from "react";
import styles from "./Confirmation.module.sass";

const Confirmation = ({ className, body, footer, onConfirm, onCancel }) => {
    return (
        <>

            <div className={cn(styles.confirm, className)}>
                <div className={styles.body}>{body}</div>
                {footer ?? (
                    <div className={cn("row", styles.footer)}>
                        <button
                            className={cn("button button-stroke", styles.button)}
                            onClick={onCancel}
                        >
                            <span>No</span>
                        </button>
                        <button
                            className={cn("button button-pink", styles.button)}
                            onClick={onConfirm}
                        >
                            <span>Yes</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Confirmation;
