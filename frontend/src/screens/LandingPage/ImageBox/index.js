import React, { useState } from "react";
import cn from "classnames";
import toast from "react-hot-toast";
import styles from "./ImageBox.module.sass";
import gstyles from "../LandingPage.module.sass";

const ImageBox = ({ className, title, description, image, actions, backgroundImage, boxClassName, mediaPosition='right', clip=true }) => {

    return (
        <div className={cn("section", styles.section, gstyles.bg_matic, className)}>
            <div className="container">
                <div className={cn(styles.box, styles[mediaPosition], {[styles.clip]: clip}, boxClassName)} style={{backgroundImage: `url(${backgroundImage})`}}>
                    <div className={styles.text}>
                        <h3 className="h3">{title}</h3>
                        <p>
                            {description}
                        </p>
                        <div className={styles.actions}>
                            {actions}
                        </div>
                    </div>
                    <div className={styles.media}>
                        <img src={image} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageBox;