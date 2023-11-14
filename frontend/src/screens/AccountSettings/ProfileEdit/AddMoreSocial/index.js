import React from "react";
import cn from "classnames";
import { trimNonEnglishCharacters } from '../../../../utils/forms';
import styles from "./AddMoreSocial.module.sass";
import TextInput from "../../../../components/TextInput";
import { useForm } from "react-hook-form";

const AddMoreSocial = ({ title, onAdded }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const inputs = watch();

  // const onAdded = (data) => {};
  return (
    <div className={styles.col}>
      {/* <div className={styles.list}> */}
      <div className={styles.c_row}>
        <div className={styles.column_2}>
          <div className={styles.item}>
            <div className={styles.category}>Add Social Account</div>
            <form className={styles.fieldset} onSubmit={handleSubmit(onAdded)}>
              <TextInput
                className={styles.field}
                label='Title*'
                type='text'
                value={inputs.title}
                placeholder='Enter the social media name i.e facebook'
                // required
                stateProp={register("title", { required: true, setValueAs: trimNonEnglishCharacters })}
                error={
                  errors.title?.type === "required" && (
                    <span>Please Enter your the Title</span>
                  )
                }
              />
              <TextInput
                className={styles.field}
                label='URL*'
                type='url'
                placeholder='Your Platform url* i.e https://fb.me/myname'
                // required
                value={inputs.url}
                stateProp={register("url", { required: true, setValueAs: trimNonEnglishCharacters })}
                error={
                  errors.url?.type === "required" && (
                    <span>Please Enter your profile url</span>
                  )
                }
              />
              <div className={styles.row_2}>
                <button className={cn("button", styles.button)}>
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoreSocial;
