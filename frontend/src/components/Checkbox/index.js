import React from "react";
import cn from "classnames";
import styles from "./Checkbox.module.sass";

const Checkbox = ({ className, content, checked, onChange, fullWidth, ...props }) => {
  return (
    <label className={cn(styles.checkbox, className)}>
      <input
        className={styles.input}
        type="checkbox"
        onChange={onChange}
        checked={checked}
        {...props}
      />
      <span className={styles.inner}>
        <span className={styles.tick}/>
        <span className={cn(styles.text, fullWidth && styles.fullWidth)}>{content}</span>
      </span>
    </label>
  );
};

export default Checkbox;
