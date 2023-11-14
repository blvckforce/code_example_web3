import React from "react";
import cn from "classnames";
import config from "../../../../config";
import { strMaxLen, trimNonEnglishCharacters } from '../../../../utils/forms';
import styles from "./NewArtist.module.sass";
import TextInput from "../../../../components/TextInput";
import TextArea from "../../../../components/TextArea";
import Loader from "../../../../components/Loader";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  subject: Yup.string()
    .min(config.inviteAgent.minSubjectLength, `Must be longer then ${config.inviteAgent.minSubjectLength} characters`)
    .max(config.inviteAgent.maxSubjectLength, `Must be less than ${config.inviteAgent.maxSubjectLength} characters`)
    .required("This field is required"),
  message: Yup.string()
    .min(config.inviteAgent.minMessageLength, `Must be longer then ${config.inviteAgent.minMessageLength} characters`)
    .max(config.inviteAgent.maxMessageLength, `Must be less than ${config.inviteAgent.maxMessageLength} characters`)
    .required("This field is required"),
  fee: Yup.number()
    .strict()
    .min(config.minAgentFee)
    .max(config.maxAgentFee)
    .required("This field is required"),
  email: Yup.string().email("Invalid email").required("This field is required"),
});

const NewArtist = ({ onAdded, busy, fee: defaultAgentFee }) => {

  const {
    errors,
    handleSubmit,
    values,
    setFieldValue,

  } = useFormik({
    initialValues: {
      email: "",
      subject: "",
      fee: defaultAgentFee,
      message: "",
    },
    validationSchema,
    onSubmit: (values) => {
      onAdded(values);
    },
  });

  const handleChange = (event) => {

    if (event.target.type === "text" || event.target.type === "textarea" || event.target.type === "email") {
      setFieldValue(event.target.name, trimNonEnglishCharacters(event.target.value));
    } else if (event.target.type === "number") {
      setFieldValue(event.target.name,
        event.target.value !== "" && event.target.value >= 0 ? +event.target.value : event.target.value);
    } else {
      setFieldValue(event.target.name, event.target.value);
    }

  };

  const changeWithLimit = (limit) => {
    return (event) => setFieldValue(event.target.name, strMaxLen((trimNonEnglishCharacters(event.target.value) ?? ""), limit));
  };

  return (
    <div className={styles.col}>
      <div className={styles.c_row}>
        <div className={styles.column_2}>
          <div className={styles.item}>
            <h4 className={styles.title}>Invite a new artist</h4>
            <form className={styles.fieldset} onSubmit={handleSubmit}>
              <TextInput
                className={styles.field}
                label='Enter the Email for invite'
                name='email'
                type='email'
                placeholder='Enter the Email for invite'
                onChange={handleChange}
                value={values.email}
                error={<span>{errors.email}</span>}
              />

              <TextInput
                className={styles.field}
                label='Subject'
                name='subject'
                type='text'
                placeholder='Invitation to join #greatArt'
                onChange={changeWithLimit(config.inviteAgent.maxSubjectLength)}
                value={values.subject}
                error={<span>{errors.subject}</span>}
              />

              <TextInput
                className={styles.field}
                label='fee (%)'
                min={config.minAgentFee}
                step={config.agentFeeStep}
                name='fee'
                type='number'
                placeholder={`Enter your fee for the artist, max of ${config.maxAgentFee}`}
                onChange={handleChange}
                value={values.fee}
                max={config.maxAgentFee}
                error={<span>{errors.fee}</span>}
              />

              <TextArea
                className={styles.field}
                label='Message'
                name='message'
                placeholder='Write Message'
                onChange={changeWithLimit(config.inviteAgent.maxMessageLength)}
                value={values.message}
                error={<span>{errors.message}</span>}
              />

              <div className={styles.row_2}>
                <button className={cn(styles.buttonWrapper, "button", styles.button)} disabled={busy}>
                  {
                    busy
                      ? (
                        <>
                          <span>Contract is singing</span>
                          <div className={styles.loader}>
                            <Loader />
                          </div>
                        </>
                      )
                      : "Send an invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArtist;
