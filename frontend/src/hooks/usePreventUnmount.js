import { useCallback, useEffect, useRef, useState } from 'react';

const defaultFunc = () => 'Sure?'; /* custom message is not supported in all modern browsers */
/***
 *
 * @return {{enablePreventUnmount: (function(): void), disablePreventUnmount: (function(): void)}}
 */
const usePreventUnmount = () => {

  const [enabled, setEnabled] = useState(false);

  const eventListenerRef = useRef(defaultFunc);

  const enablePreventUnmount = useCallback(() => setEnabled(true), []);
  const disablePreventUnmount = useCallback(() => setEnabled(false), []);


  useEffect(() => {
    eventListenerRef.current = (event) => {

      const returnValue = defaultFunc?.(event);
      // Handle legacy `event.returnValue` property
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      if (typeof returnValue === 'string') {
        return (event.returnValue = returnValue);
      }

      // Chrome doesn't support `event.preventDefault()` on `BeforeUnloadEvent`,
      // instead it requires `event.returnValue` to be set
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#browser_compatibility
      if (event.defaultPrevented) {
        return (event.returnValue = '');
      }
    };
  }, []);

  useEffect(() => {
    const eventListener = (event) => eventListenerRef.current(event);
    if (enabled) window.addEventListener('beforeunload', eventListener);
    if (!enabled) window.removeEventListener('beforeunload', eventListener);
    return () => {
      window.removeEventListener('beforeunload', eventListener);
    };
  }, [enabled]);


  return {
    enablePreventUnmount, disablePreventUnmount,
  };
};

export default usePreventUnmount;
