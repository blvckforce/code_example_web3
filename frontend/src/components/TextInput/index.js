import { noop } from "lodash-es";
import React, { isValidElement } from "react";
import cn from "classnames";
import styles from "./TextInput.module.sass";
import Calendar from "../Calendar";

const renderInput = (props) => {
  const { className, onChange, name, required, value = "", ...rest } = props;

  const onWheel = () => document.activeElement.blur();

  const defaultProps = { className, onChange, name, required, value, ...rest };

  switch (rest.type) {
    case "date": {
      const renderInput = (calendarInputProps) => (
        <input
          {...calendarInputProps}
          className={className}
          onChange={noop}
          placeholder={defaultProps.placeholder}
        />
      );

      const onCalendarChange = (value) => onChange({ target: { name, value } });

      return (
        <Calendar
          value={value}

          renderInput={renderInput}
          onChange={onCalendarChange}
          {...rest}
          {...props.disabled && { open: false }}
        />
      );
    }

    case "number": {
      return (
        <input
          onWheel={onWheel}
          {...defaultProps}
          onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
        />
      );
    }

    case "percent": {
      return (
        <div className={styles.percentWrapper}>
          <input
            onWheel={onWheel}
            {...defaultProps}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            type='number'
          />
          <span className={styles.percentSymbol}>%</span>
        </div>
      );
    }

    case "textarea": {
      return (
        <textarea
          rows={6}
          style={{ resize: "none", marginTop: "auto", marginBottom: 'auto', minHeight: "6rem" }}
          {...defaultProps}
        />
      );
    }

    default: {
      return (
        <input {...defaultProps} />
      );
    }
  }
};

const TextInput = ({ className, label, error, withError, stateProp, suffix, prefix, ...props }) => {
  return (
    <div className={cn(styles.field, className)}>
      {label && <label htmlFor={label ?? props.name} className={styles.label}>{label}</label>}
      <div className={cn(styles.wrap, ({
        [styles.withSuffix]: suffix !== undefined,
        [styles.withError]: withError,
        [styles.withPrefix]: prefix !== undefined,
      }))}>
        {
          isValidElement(prefix) && <div className={styles.prefix}>{prefix}</div>
        }
        {renderInput({
          className: styles.input,
          ...props,
          ...stateProp,
          ...(label && { id: props.name ?? label }),
        })}
        {
          isValidElement(suffix) && <div className={styles.suffix}>{suffix}</div>
        }
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default TextInput;

export const AdvInput = ({
                           className,
                           inputClassName,
                           start,
                           label,
                           end,
                           error,
                           stateProp,
                           ...props
                         }) => (
  <div className={cn(styles.field, className)}>
    {label && <div className={styles.label}>{label}</div>}
    <div className={cn(styles.card)} action=''>
      <div className={cn(styles.icon, styles.lead)}>{start}</div>
      <input
        className={cn(styles.input_2, inputClassName)}
        type='text'
        // value={search}
        // onChange={(e) => setSearch(e.target.value)}
        name='input'
        placeholder='Search by creator or collectible'
        required
        {...props}
        {...stateProp}
      />
      {end && <div className={styles.icon}>{end}</div>}
    </div>
    {error && <div className={styles.error}>{error}</div>}
  </div>
);
