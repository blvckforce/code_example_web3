import { useEffect, useState } from "react";
import API from "../../services/API";

let config = { notify: true };
const useApiData = (accountId) => {

  const [categories, setCategories] = useState([]);
  const [chains, setChains] = useState();
  const [intervalOptions, setIntervalOptions] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // get list of relationships

    API.getPeriods(config).then((resp) => {
      if (!resp.error && resp.data && Array.isArray(resp.data)) {
        setIntervalOptions((resp.data).sort(({ key: a }, { key: b }) => +a - +b));
      }
    });

    API.getCategories().then((resp) => {
      if (!resp.error && resp.data)
        setCategories(resp.data);
    });

    API.getChains().then((resp) => {
      if (!resp.error && resp.data)
        setChains(resp.data);
    });

  }, []);

  useEffect(() => {
    if (accountId) {
      API.getMyCollections().then((resp) => {
        if (!resp.error && resp.data)
          setCollections(resp.data);
      });
    }
  }, [accountId]);

  return {
    categoriesList: categories,
    chainsList: chains,
    intervalOptionsList: intervalOptions,
    collectionsList: collections,
  };
};

export default useApiData;
