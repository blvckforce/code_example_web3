import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import cn from "classnames";
import styles from "./Modal.module.sass";
import Icon from "../Icon";

const Modal = ({
                 outerClassName, containerClassName, visible, onClose, title,
                 disableOutsideClick = false, children, footer,
               }) => {
  const escFunction = useCallback(
    (e) => {
      if (e.keyCode === 27) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (visible) document.addEventListener("keydown", escFunction, false);
    if (!visible) document.removeEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction, visible]);

  const scrollRef = useRef(null);

  useEffect(() => {

    visible ? disableBodyScroll(scrollRef) : enableBodyScroll(scrollRef);

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [visible]);

  return createPortal(
    <div ref={scrollRef}>
      {visible && (
        <div className={styles.modal}>
          <div className={cn(styles.outer, outerClassName)}>
            {/*<OutsideClickHandler onOutsideClick={onClose} disabled={disableOutsideClick}>*/}
            <div className={styles.wrapper}>
              <div className={cn(styles.container, containerClassName)}>
                <div className={styles.title}>
                  {title && <h4 className='h4'>{title}</h4>}
                </div>
                <div className={styles.divider} />
                {children}
                <div className={styles.divider} />
                <div className={styles.footer}>
                  {footer}
                </div>
                <button className={styles.close} onClick={onClose} aria-label={'close'} title={'Close'}>
                  <Icon name='close' size='14' aria-hidden />
                </button>
              </div>
            </div>
            {/*</OutsideClickHandler>*/}
          </div>
        </div>
      )}</div>,
    document.body,
  );
};

export default Modal;
