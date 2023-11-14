import { useEffect, useState } from "react";
import API from "../services/API";
import { currencyOptions, filterDefaultCollection } from "../utils/helpers";


export function useSettings(defaultSettings) {

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(
    defaultSettings ?? {
      categories: [],
      chains: [],
      collection: [],
      payment: [],
      title: "",
      description: "",
      currencyOptions: currencyOptions ?? [],
    },
  );

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    const fetchSettings = async () => {
      let resp = await API.getSettings();
      if (resp.data && !resp.error) {
        const { collection = [], ...tail } = resp.data;
        setSettings(prevState => ({ ...prevState, ...tail, collection: filterDefaultCollection(collection) }));
      }
    };

    setLoading(true);
    fetchSettings().catch(console.error).finally(() => setLoading(false));
  }, []);

  return { ...settings, loading };
}
