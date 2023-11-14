import React, { useState } from "react";
import cn from "classnames";
import { useProfile } from "../../contexts/profile.context";
import styles from "./Report.module.sass";
import TextArea from "../TextArea";
import API from "../../services/API";
import toast from "react-hot-toast";
import Loader from "../Loader";

const Report = ({ className, type, typeId, onCancel }) => {

  const [message, setMessage] = useState();
  const [busy, setBusy] = useState(false);

  const { profile } = useProfile();
  const submitReport = async () => {

    let data = {
      type: type,
      message: message,
    };

    if (profile?.isAuthorized)
      data.reporter = profile.account.id;

    data[type] = typeId;

    setBusy(true);

    const resp = await API.report(data);
    setBusy(false);

    if (resp && resp.data && !resp.error) {

      toast.success("Reported");

      if (onCancel)
        onCancel();
    }
  };

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={styles.text}>
        Describe why you think this {type} should be removed from marketplace
      </div>
      <TextArea
        className={styles.field}
        label='message'
        name='Message'
        placeholder='Tell us the details'
        required='required'
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className={styles.btns}>
        <button onClick={submitReport} className={cn("button", styles.button)} disabled={busy}>
          {busy ? <Loader /> : "Send now"}
        </button>
        <button onClick={onCancel} className={cn("button-stroke", styles.button)}>Cancel</button>
      </div>
    </div>
  );
};

export default Report;
