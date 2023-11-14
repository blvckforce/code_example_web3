import React, { useCallback, useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import { callWithTimeout } from '../../utils/forms';
import styles from "./Dropdown.module.sass";
import Icon from "../Icon";

const Dropdown = ({
                    className, value, setValue, value_index = "id",
                    label_index = "name", options, defaultValueIndex,
                    error, disabled, label,
                  }) => {

  const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValueIndex
      ? options.find((x) => x?.[value_index] === defaultValueIndex)?.[label_index]
      : value,
  );

  const handleClick = useCallback((value, index = null, close = true) => {

    if (disabled) return;

    setValue(value);
    if (index !== null && value_index) {
      setSelectedOption(options[index][label_index]);
    } else {
      setSelectedOption(value);
    }
    if (close) setVisible(false);
  }, [disabled, label_index, options, setValue, value_index]);

  const switchVisible = () => setVisible(prevState => !prevState);

  const onClick = () => disabled ? undefined : switchVisible();

  const onEnter = (e) => {
    const code = e.code?.toLowerCase();
    const withArrows = code === 'arrowdown' || code === 'arrowup';
    if (withArrows) e.preventDefault();
    if (code === 'enter' || (!visible && withArrows)) {
      onClick();
      callWithTimeout(
        () => document.activeElement.nextElementSibling.focus(), 50,
      );
    }
  };


  const onKeyboardSelect = useCallback((e) => {
    e.preventDefault();
    const code = e.code?.toLowerCase() ?? '';

    const isObject = typeof options[0] === 'object';
    const currentIndex = options.findIndex(i => i === selectedOption || i.name === selectedOption);

    if (code === 'arrowdown') {

      if (currentIndex + 1 <= options.length - 1) {
        handleClick(options[currentIndex + 1], isObject ? currentIndex + 1 : null, false);
      }
    }
    if (code === 'arrowup') {
      if (currentIndex > 0) {
        handleClick(options[currentIndex - 1], isObject ? currentIndex - 1 : null, false);
      }
    }
    if (code === 'tab' || code === 'enter') {
      onClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClick, options, selectedOption]);

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
        <div
          className={cn(styles.dropdown, className, { [styles.active]: visible })}
        >
          {label && <label className={styles.label} htmlFor={`select-${label}`}>{label}</label>}
          <div className={styles.head} onClick={onClick} {...(label && { id: `select-${label}` })}
               onKeyDown={onEnter}
               role={'button'} tabIndex={0} aria-haspopup
          >
            <span className={styles.selection}>{selectedOption}</span>
            <div className={styles.arrow}>
              <Icon name='arrow-bottom' size='10' />
            </div>
          </div>
          <div className={styles.body} role={'listbox'} tabIndex={0}
               onKeyDown={onKeyboardSelect}
          >
            {
              value_index ?
                options.map((x, index) => {
                  if (x[value_index] === value && !selectedOption)
                    setSelectedOption(x[label_index]);
                  return (
                    <option
                      className={cn(styles.option, {
                        [styles.selected]: x[value_index] === value?.[value_index],
                      })}
                      onClick={() => handleClick(x[value_index], index)}
                      key={index}
                    >
                      {x[label_index]}
                    </option>
                  );


                })
                :
                options.map((x, index) => (
                  <div
                    className={cn(styles.option, {
                      [styles.selected]: x === value,
                    })}
                    onClick={() => handleClick(x)}
                    key={index}
                  >
                    {x}
                  </div>
                ))
            }
          </div>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </OutsideClickHandler>
    </>
  );
};

export default Dropdown;
