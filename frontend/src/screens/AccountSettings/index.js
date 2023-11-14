import React, { useState } from "react";
import cn from "classnames";
import SEO from '../../components/SEO';
import styles from "./AccountSettings.module.sass";
import Notice from "../../components/Notice";
import BuyCrypto from "./BuyCrypto";
import ProfileEdit from "./ProfileEdit";
import PaymentEdit from "./PaymentEdit";

const settingsOptions = [
  { key: "edit_profile", label: "Edit Profile", icon: "🤖" },
  { key: "notification", label: "Notifications", icon: "🔔" },
  { key: "bye_crypto", label: "Buy Crypto", icon: "💳" },
  // { key: "payment", label: "Payment Methods", icon: "💸" },
];

const title = "Account Settings";

const AccountSettings = ({ moduleName = "edit_profile" }) => {
  const [selection, setSelection] = useState(moduleName);
  const [selected, setSelected] = useState(moduleName);

  const select = (key) => {
    setSelection(key);
    setSelected(key);
  };

  //   useEffect(() => {
  //     setSelected(selected);
  //   }, [moduleName, selected]);

  const module = moduleComponents[selection];

  return module ? (
    <>
      <SEO title={module?.props?.title ?? title} url={window.location.href} />

      <div className={cn("section-pt0", styles.section)}>
      <div className={styles.row}>
        <div className={styles.nav}>
          {settingsOptions.map((option, index) => (
            <div className={styles.status} key={index}>
              <button
                key={option.key}
                onClick={() => select(option.key)}
                className={cn("button-small", styles.filter_button, {
                  [styles.button_outline]: selected === option.key,
                })}
              >
                <div className={styles.row}>
                  <h4 className={styles.icon}>{option.icon}</h4>
                  <h6 className={styles.label}>{option.label}</h6>
                </div>
              </button>
            </div>
          ))}
        </div>
        <div className="inner-container">
          <div className={cn(styles.wrapper)}>
            <div className={styles.body}>{module}</div>
          </div>
        </div>
      </div>
    </div>
    </>
  ) : (
    <Notice message={`${moduleName} Not Found`} type="Error" />
  );
};

const moduleComponents = {
  edit_profile: <ProfileEdit title={title} />,
  payment: <PaymentEdit title={title} />,
  notification: <Notice message={`Yet to be implemented`} type="TODO" />,
  bye_crypto: <BuyCrypto title="Buy Crypto" />,
};

export default AccountSettings;
