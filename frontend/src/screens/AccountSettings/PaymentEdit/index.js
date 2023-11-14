import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./PaymentEdit.module.sass";
import Control from "../../../components/Control";
import TextInput, { AdvInput } from "../../../components/TextInput";
import TextArea from "../../../components/TextArea";
import Icon from "../../../components/Icon";
import Image from "../../../components/Image";
import Modal from "../../../components/Modal";
import AddCard from "./AddCard/index.js";
// import masterCard from ""
const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Edit Payment",
  },
];

const PaymentEdit = ({ title }) => {
  const [selected, setSelected] = useState(0);
  const [balance, setBalance] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const tabs = () => ["Balances", "Credit Cards"];

  const selectType = (key) => {
    setSelected(key);
    setBalance(key === 0);
  };

  const handleClick = (evt) => {
    evt.preventDefault();
  };
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={cn("h2", styles.title)}>{title}</h1>
        <div className={styles.info}>
          <div className={cn(styles.col, styles.chips)}>
            {tabs().map((item, index) => (
              <button
                key={index}
                onClick={() => selectType(index)}
                className={cn(
                  "button-small",
                  styles.button,
                  selected === index ? styles.btn_s : styles.btn_o
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      {balance ? (
        <div>
          <div>
            {[
              { title: "Balance", value: "$ 0.00" },
              { title: "Holds", value: "$ 0.00" },
            ].map((item) => (
              <h6 className={styles.act_label}>
                {item.title}:{"  "}
                <span className={styles.act_value}>{item.value}</span>
              </h6>
            ))}
          </div>
          <div className={styles.text}>
            There is a $5,000 weekly cash out limit with a bank account, and a
            ,000 daily limit with Gemini.
          </div>
          <div className={styles.c_row}>
            <div className={styles.column}>
              <button
                className={cn(
                  "button-stroke button-small",
                  styles.button,
                  styles.btn_border
                )}
              >
                <span>Connect A Bank Account</span>
              </button>
              <br />
              <button
                className={cn(
                  "button-stroke button-small",
                  styles.button,
                  styles.btn_border
                )}
              >
                <span>Connect Gemini Account</span>
                <Icon name="plus-circle" size="16" />
              </button>
            </div>
            <div></div>
          </div>
        </div>
      ) : (
        <>
          <h6 className={styles.caption}>Your Saved Credit Cards:</h6>
          <div className={styles.c_row}>
            <div className={cn(styles.fieldset, styles.column_2)}>
              <AdvInput
                name="visa"
                type="text"
                placeholder="5469 **** **** ****"
                required
                className={styles.field}
                start={<Image src={"/images/content/visa.png"} />}
                end={
                  <button
                    onClick={handleClick}
                    className={cn(
                      styles.btn_no_border
                      // styles.btn_border
                    )}
                  >
                    <span>Edit</span>
                  </button>
                }
              />
              <AdvInput
                name="master"
                type="text"
                placeholder="5469 **** **** ****"
                required
                className={styles.field}
                start={<Image src={"/images/content/master-card-logo.png"} />}
                end={
                  <button
                    onClick={handleClick}
                    className={cn(
                      styles.btn_no_border
                      // styles.btn_border
                    )}
                  >
                    <span>Edit</span>
                  </button>
                }
              />
            </div>
            <div className={styles.column_3}></div>
          </div>
          <br />
          <button
            onClick={() => setShowModal(true)}
            className={cn("button-small", styles.button)}
          >
            Add New Card
          </button>
        </>
      )}
      <Modal
        visible={showModal}
        outerClassName={styles.wallet_modal}
        containerClassName={styles.wallet_modal_container}
        onClose={() => setShowModal(false)}
      >
        <AddCard />
      </Modal>
    </div>
  );
};

export default PaymentEdit;
