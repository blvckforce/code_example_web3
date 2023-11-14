import { useCallback } from 'react';

/***
 *
 * @param {function(key: string, id: string|number, label: string): void} callback
 * @return {(function(key: string, id: string|number, label: string): function(): void)}
 */
export default function useFiltersClick(callback) {

  return useCallback((name, id, label) => () => {
    callback(name, id, label);
  }, [callback]);
}
