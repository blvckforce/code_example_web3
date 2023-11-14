import React, { useState } from "react";
import cn from "classnames";
import styles from "./FolowSteps.module.sass";
import Icon from "../../../components/Icon";
import LoaderCircle from "../../../components/LoaderCircle";

const FolowSteps = ({ className, nftStatus, nftType, mintItem, createSale, createAuction, onClose }) => {
    const [note, setNote] = useState("");

    const renderLoader = () => (
        <div className={styles.icon}>
            {nftStatus === 3 && <LoaderCircle className={styles.loader}/>}
            {nftStatus === 4 && <Icon name="check" size="24"/>}
        </div>
    );

    const renderCommonButtons = (onCreate) => (
        <div className={styles.footer}>
            {nftStatus < 3 && (
                <button onClick={onCreate} className={cn("button", styles.start, styles.button)}>
                    Start
                </button>
            )}
            {nftStatus === 3 && (
                <button className={cn("button", styles.start, styles.button)}>
                    In progress
                </button>
            )}
            {nftStatus === 4 && (
                <button onClick={() => onClose()} className={cn("button", styles.start, styles.button)}>
                    Done
                </button>
            )}
            {nftStatus < 4 && (
                <button onClick={() => onClose()} className={cn("button button-outline", styles.button)}>
                    Cancel
                </button>
            )}
            {nftStatus === 4 && (
                <button onClick={() => onClose()} className={cn("button button-outline", styles.button)}>
                    Close
                </button>
            )}
        </div>
    );

    return (
        <div className={cn(className, styles.steps)}>
            <div className={styles.list}>

                <div className={cn(styles.item)}>
                    <div className={styles.head}>
                        <div className={styles.icon}>
                            {nftStatus === -1 && <LoaderCircle className={styles.loader}/>}
                            {/*{nftStatus === 0 && <Icon name="check" size="24"/>}*/}
                            {nftStatus === 1 && <LoaderCircle className={styles.loader}/>}
                            {nftStatus >= 2 && <Icon name="check" size="24"/>}
                        </div>
                        <div className={styles.details}>
                            <div className={styles.info}>Mint</div>
                            <div className={styles.text}>Send transaction to create your NFT</div>
                        </div>
                    </div>
                    {nftStatus === 0 && (
                        <button
                            type="button"
                            onClick={mintItem}
                            className={cn("button", styles.start, styles.button)}
                        >
                            Start
                        </button>
                    )}
                    {nftStatus === 1 && (
                        <button type="button" className={cn("button button-outline", styles.button)}>
                            In progress
                        </button>
                    )}
                    {nftStatus >= 2 && (
                        <button type="button" className={cn("button button-outline", styles.button)} disabled>
                            Done
                        </button>
                    )}
                </div>


                {nftType === "fixed" && (
                    <div className={styles.item}>
                        <div className={cn(styles.head, styles.start)}>
                            {renderLoader()}
                            <div className={styles.details}>
                                <div className={styles.info}>Put on sale</div>
                                <div className={styles.text}>
                                    Sign message to put item on sale
                                </div>
                            </div>
                        </div>
                        {renderCommonButtons(createSale)}
                    </div>
                )}

                {(nftType === "bid") && (
                    <div className={styles.item}>
                        <div className={cn(styles.head, styles.start)}>
                            {renderLoader()}
                            <div className={styles.details}>
                                <div className={styles.info}>Start auction</div>
                                <div className={styles.text}>
                                    Sign message to create timed auction
                                </div>
                            </div>
                        </div>
                        {renderCommonButtons(createAuction)}
                    </div>
                )}
            </div>
            {note && (
                <div className={styles.note}>
                    Something went wrong, please{" "}
                    <a href="/#" target="_blank" rel="noopener noreferrer">
                        try again
                    </a>
                </div>
            )}
        </div>
    );
};

export default FolowSteps;
