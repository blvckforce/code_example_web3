import React from "react";
import cn from "classnames";
import styles from "./Notification.module.sass";
import Icon from "../../../components/Icon";
import Image from "../../../components/Image";

export const NotificationType = {

    unRegistered: "unRegisterd",
    pending: "pending",
    rejected: "rejected",
    approved: "approved",
    fee_update: "fee_update",
};

const CreatedNotification = ({ type, onSuccessClick, onNegativeClick, className, text }) => {
    const unregistered = type === NotificationType.unRegistered || !type;
    const pending = type === NotificationType.pending;
    const approved = type === NotificationType.approved;
    const rejected = type === NotificationType.rejected;
    const feeUpdate = type === NotificationType.fee_update;
    return (
        <div
            className={cn(
                styles.container,
                pending && styles.pending,
                approved && styles.approved,
                unregistered && styles.approved,
                rejected && styles.rejected,
                feeUpdate && styles.feeupdate,
                className
            )}
        >
            <div className={cn("row", styles.row)}>
                <div className={styles.prefix}>
                    <Icon
                        name={pending || feeUpdate ? "info-circle" : "add-square"}
                        size={18}
                    />
                </div>

                <div className={styles.label}>
                    {unregistered && (
                        <span>
                            To have your profile ticked, you need to pass the artist verification on our website, which will take you a few minutes.
                        </span>
                    )}
                    {pending && (
                        <span>
                            Your application for registration as a verified artist is under consideration!
                        </span>
                    )}
                    {rejected && (
                        <span>
                            Your application for verified artist has been rejected. Please fill out the form again!
                        </span>
                    )}
                    {approved && (
                        <span>
                            You have successfully passed the artist <br /> verification! Now
                            you can have more sales and <br />
                            trust!
                        </span>
                    )}
                    {feeUpdate && <span>{text}</span>}
                </div>
            </div>
            {feeUpdate ? (
                <div className={cn("row", styles.actions)}>
                    <button className="button-stroke button-small" onClick={onNegativeClick}>
                        <span>Reject</span>
                    </button>
                    <button className={cn("button button-small", styles.btn)} onClick={onSuccessClick}>
                        <span>Accept</span>
                    </button>
                </div>
            ) : (
                <button
                    className={cn("button", styles.button)}
                    onClick={onSuccessClick}
                >
                    {pending && <span>Start verification</span>}
                    {unregistered && <span>Start verification</span>}
                    {rejected && <span>Start verification</span>}
                    {approved && <span>Upload your work</span>}
                    <span>
                        <Image
                            src={
                                !approved
                                    ? "/images/content/document.svg"
                                    : "/images/content/gallery.svg"
                            }
                        />
                    </span>
                </button>
            )}
        </div>
    );
};

export default CreatedNotification;
