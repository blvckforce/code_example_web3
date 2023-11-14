import styles from "./TimeLeft.module.sass"
import Image from "../Image"
import cn from "classnames";

const TimeLeft = (props) => {
    let { preTag, tag, time, showIcon, className } = props;

    if (showIcon == null) {
        showIcon = true;
    }

    return (
        <div className={cn("row", styles.timer, className)}>
            {showIcon && (
                <span role="img" aria-label="fire">
                    <Image src="/images/content/time_circle.svg"/>
                </span>
            )}
            {
                preTag
                    ? (
                        <span className={styles.label}>
                            &nbsp;{preTag}:&nbsp;
                        </span>
                    )
                    : null
            }
            <span className={styles.time}>
                {" "}{time}
            </span>
            {
                tag
                    ? (
                        <span className={styles.label}>
                            &nbsp;{tag}
                        </span>
                    )
                    : null
            }
        </div>
    );
};

export default TimeLeft;
