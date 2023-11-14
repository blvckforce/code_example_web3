import cn from "classnames";
import styles from "./Notice.module.sass";
import Image from "../Image";

const Notice = ({
    action,
    message,
    type,
    children
}) => {

    return (
        <div className={cn("section", styles.section)}>
            <div className={cn("container", styles.container)}>
                <div className={styles.preview}>
                    <Image
                        srcSet="/images/content/figures@2x.png 2x"
                        srcSetDark="/images/content/figures-dark@2x.png 2x"
                        src="/images/content/figures.png"
                        srcDark="/images/content/figures-dark.png"
                        alt={message}
                    />
                    {action}
                </div>
                <div className={styles.wrap}>
                    <h2 className={cn("h2", styles.title)}>
                        {message}
                    </h2>
                    <div className={styles.info}>{type}</div>

                </div>
                {children}
            </div>
        </div>
    );
};

export default Notice;
