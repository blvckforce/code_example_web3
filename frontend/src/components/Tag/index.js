import styles from "./Tag.module.sass"

const Tag = ({ children }) => {
    return (
        <div className={styles.tag}>
            {children}
        </div>
    );
};

export default Tag;