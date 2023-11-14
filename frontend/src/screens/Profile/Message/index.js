import React from "react";
import cn from "classnames";
import styles from "./Message.module.sass";
import TextInput from "../../../components/TextInput";
import { useForm } from "react-hook-form";
import TextArea from "../../../components/TextArea";
import Loader from "../../../components/Loader";

const MessagePopup = ({ onSubmit, data, busy }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const inputs = watch();

    return (
        <div className={styles.col}>
            <div className={styles.c_row}>
                <div className={styles.column_2}>
                    <div className={styles.item}>
                        <div className={styles.title}>Write a message</div>
                        <form className={styles.fieldset} onSubmit={handleSubmit(onSubmit)}>
                            <TextInput
                                className={styles.field}
                                label="T0"
                                type="text"
                                placeholder="Enter Agent Mail"
                                defaultValue={data.email || ''}
                                value={inputs.to}
                                stateProp={register("to", { required: !data.email })}
                                disabled={data.email}
                                error={
                                    errors.to?.type === "required" && (
                                        <span>Please Enter your the recepient for this mail</span>
                                    )
                                }
                            />
                            <TextInput
                                className={styles.field}
                                label="THEME"
                                type="text"
                                placeholder="Enter  the theme of this message"
                                value={inputs.subject}
                                stateProp={register("subject", { required: true })}
                                error={
                                    errors.theme?.type === "required" && (
                                        <span>Please Enter your profile url</span>
                                    )
                                }
                            />
                            <TextArea
                                className={styles.field}
                                label="Text Message"
                                name="message"
                                placeholder="Write Message"
                                stateProp={register("message", {
                                    required: true,
                                    minLength: { value: 20 },
                                })}
                                error={
                                    errors.message?.type === "required" ? (
                                        <span>Please type some message</span>
                                    ) : (
                                        errors.message?.type === "minLength" && (
                                            <span>
                                                You write at least 10 words
                                            </span>
                                        )
                                    )
                                }
                            />
                            <div className={styles.row_2}>
                                <button className={cn("button", styles.button)} disabled={busy}>
                                    {busy ? <Loader /> : 'Send a message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagePopup;
