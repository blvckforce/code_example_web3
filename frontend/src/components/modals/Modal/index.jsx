import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { createPortal } from 'react-dom';
import classes from './styles.module.scss';
import cn from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import Icon from '../../Icon';

const Modal = ({ children, onClose, visible, outerClassName, containerClassName, closable = true }) => {

  const escFunction = useCallback(
    (e) => {
      if (e.code === 'Escape') {
        if (typeof onClose === 'function') onClose();
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
      {
        visible && (
          <>
            <div className={classes.modal}>
              <div className={cn(classes.outer, outerClassName)}>
                {/*<OutsideClickHandler onOutsideClick={onClose} disabled={disableOutsideClick}>*/}
                <div className={classes.wrapper}>
                  <div className={cn(classes.container, containerClassName)}>
                    {children}
                  </div>
                </div>
                {
                  closable &&
                  <button className={classes.close} onClick={onClose} aria-label={'close'} title={'Close'}>
                    <Icon name='close' size='14' aria-hidden />
                  </button>
                }
              </div>
            </div>
          </>
        )
      }
    </div>, document.body,
  );
};

Modal.Header = ({ title, children }) => (
  <>
    <div className={classes.header}>
      {title && <h4 className='h4'>{title}</h4>}
    </div>
    {children}
    <div className={classes.divider} />
  </>
);

Modal.Body = ({ children }) => (
  <>{children}</>
);

Modal.Footer = ({ children, className = '' }) => (
  <>
    <div className={classes.divider} />
    <div className={className}>
      {children}
    </div>
  </>
);

export default Modal;
