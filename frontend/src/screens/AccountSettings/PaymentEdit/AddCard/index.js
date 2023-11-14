import React from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./PaymentEdit.module.sass";
import TextInput from "../../../../components/TextInput";

const AddCard = ({ title }) => {
  return (
    <div className={styles.col}>
      {/* <div className={styles.list}> */}
      <div className={styles.c_row}>
        <div className={styles.column_2}>
          <div className={styles.item}>
            <div className={styles.category}>Add Card</div>
            <div className={styles.fieldset}>
              <TextInput
                className={styles.field}
                label="Full Name*"
                name="Name"
                type="text"
                placeholder="Enter Cardholder Name"
                required
              />
              <TextInput
                className={styles.field}
                label="Credit card number*"
                name="card"
                type="text"
                placeholder="Enter Card Number"
                required
              />
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.fieldset}>
              <div className={styles.btns}>
                <TextInput
                  className={styles.field}
                  label="Exp. Date*"
                  name="Portfolio"
                  type="text"
                  placeholder="00/00"
                  required
                />
                <TextInput
                  className={styles.field}
                  label="CVC/CVV*"
                  name="Portfolio"
                  type="text"
                  placeholder="00/00"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.row_2}>
        <button className={cn("button", styles.button)}>Enter Billing Info</button>
      </div>
    </div>
  );
};

export default AddCard;
