import React from "react";
import cn from "classnames";
import styles from "./Preview.module.sass";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";

const Preview = ({ className, onClose, item , previewType }) => {



  return (
        <div className={cn(className, styles.wrap)}>
            <div className={styles.inner}>
                <button className={styles.close} onClick={onClose}>
                    <Icon name="close" size="14" />
                </button>
                <div className={styles.info}>Preview</div>
                <Card item={item} isPreview={true} />
                {/*
                    <button className={styles.clear}>
                    <Icon name="circle-close" size="24" />
                    Clear all
                    </button>
                */}
            </div>
        </div>
    );
};

export default Preview;
