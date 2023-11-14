import React from "react";
import styles from "./SearchInput.module.sass";
import cn from "classnames";
import Icon from "../Icon";

const SearchInput = ({
                       onSubmit,
                       className,
                       inputClassName,
                       iconClassName,
                       iconDirection = "left",
                       ...props
                     }) => {
  const leftDirection = iconDirection === "left";
  const rightDirection = iconDirection === "right";
  const icon = (
    <button className={cn(styles.result, (styles[iconDirection] ?? ''), iconClassName)}>
      <Icon name='search' size='20' />
    </button>
  );
  return (
    <div>
      <form
        className={cn(className, styles.search)}
        action=''
        onSubmit={onSubmit}
      >
        {leftDirection && icon}
        <input
          className={cn(styles.input, inputClassName, rightDirection && styles.no_left)}
          type='text'
          //   value={search}
          name='search'
          placeholder={props.placeholder || "enter a text"}
          required
          {...props}
        />
        {rightDirection && icon}
      </form>
    </div>
  );
};

export default SearchInput;
