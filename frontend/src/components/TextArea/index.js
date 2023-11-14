import cn from "classnames";
import styles from "./TextArea.module.sass";

const TextArea = ({ className, label, error, stateProp, ...props }) => {
    return (
        <div className={cn(styles.field, className)}>
            {label && <div className={styles.label}>{label}</div>}
            <div className={styles.wrap}>
                <textarea className={styles.textarea} {...props} {...stateProp} />
            </div>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default TextArea;
