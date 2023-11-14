import { useEffect, useState } from 'react';
import API from '../services/API';

/***
 *
 * @param collectionId : number - collection ID
 * @return {{properties: {[string]: {
 *   value: string,
 *   count: string | number
 * }[]}|null}}
 */
export default function useCollectionProperties(collectionId) {

  const [properties, setProperties] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.getCollectionProperties(collectionId);

        if (data) setProperties(data);
      } catch (e) {
        console.error(e);
        setProperties(null);
      }
    })();
  }, [collectionId]);

  return {
    properties,
  };
}
