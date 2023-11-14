import { useCallback, useState } from 'react';

/***
 *
 * @param initialState
 * @return {{visible: boolean, close: (function(): void), open: (function(): void), switchVisible: (function(): void)}}
 */
export default function useModalVisibility(initialState = false) {

  const [visible, setVisible] = useState(initialState);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const switchVisible = useCallback(() => setVisible(prevState => !prevState), []);

  return { visible, open, close, switchVisible };
}

